export interface RoutePoint {
  x: number
  y: number
}

interface NodeBox {
  id: string
  x: number
  y: number
  width: number
  height: number
}

interface SystemEdgeInput {
  id: string
  source: string
  target: string
  category: string
}

const CATEGORY_ORDER = [
  'ERP/MRP System',
  'Department Software',
  'Spreadsheet/Tracker',
  'QMS / Compliance',
  'AI/Automation',
]

/**
 * Which side of the diagram each category's bus lives on. Fixed per
 * category (never split) so same-colored lines stay visually grouped.
 */
const CATEGORY_SIDE: Record<string, 'left' | 'right'> = {
  'ERP/MRP System': 'right',
  'QMS / Compliance': 'right',
  'Department Software': 'left',
  'Spreadsheet/Tracker': 'left',
  'AI/Automation': 'left',
}

const LANE_GAP = 32
const LANE_SPACING = 20
/** Clearance kept between a detoured line and the row of nodes it's stepping around. */
const CLEAR_MARGIN = 20
/**
 * Minimum straight distance a line travels leaving/entering a tap point
 * before it's allowed to bend. Without this, a detour (see clearanceY)
 * could bend immediately at the node's border, so the line would meet its
 * connect dot at a steep angle instead of straight-on — the dot's own
 * "straight out" direction is horizontal, and anything touching it has to
 * honor that for at least this many px.
 */
const STUB_LENGTH = 40

/** Exact coordinate of a node's left/right connect dot — PipelineNode.tsx's Position.Left/Right handles. */
function sideTapPoint(box: NodeBox, side: 'left' | 'right'): RoutePoint {
  return { x: side === 'right' ? box.x + box.width : box.x, y: box.y + box.height / 2 }
}

/** The tap point pushed straight out by STUB_LENGTH — where a bend is first allowed. */
function stubPoint(tap: RoutePoint, side: 'left' | 'right'): RoutePoint {
  return { x: tap.x + (side === 'right' ? STUB_LENGTH : -STUB_LENGTH), y: tap.y }
}

/**
 * Nodes (other than the edge's own endpoints) whose box crosses the
 * horizontal band between x1 and x2 at height y — i.e. what a straight tap
 * stub at that height would cut across. Several side-by-side "work center"
 * nodes sitting between a tap point and its bus lane is the common case
 * (e.g. reaching the leftmost of 4 parallel nodes when the lane runs past
 * all of them on the right).
 */
function findObstructions(boxes: NodeBox[], excludeIds: Set<string>, y: number, x1: number, x2: number): NodeBox[] {
  const lo = Math.min(x1, x2)
  const hi = Math.max(x1, x2)
  return boxes.filter((box) => {
    if (excludeIds.has(box.id)) return false
    const overlapsX = box.x < hi && box.x + box.width > lo
    const overlapsY = y > box.y && y < box.y + box.height
    return overlapsX && overlapsY
  })
}

/** Y just clear of every obstruction at once, on whichever side is the shorter detour from y. */
function clearanceY(obstructions: NodeBox[], y: number): number {
  const above = Math.min(...obstructions.map((b) => b.y)) - CLEAR_MARGIN
  const below = Math.max(...obstructions.map((b) => b.y + b.height)) + CLEAR_MARGIN
  return Math.abs(y - above) <= Math.abs(y - below) ? above : below
}

/**
 * Connections within the same category that share an endpoint — a fan-out
 * (one source, several targets) or fan-in (several sources, one target) —
 * are transitively grouped into one connected component per category via
 * union-find. Members of the same component share a single lane instead of
 * each claiming its own, which is what turns "Engineering pushes files to
 * 4 work centers" from 4 separate parallel lines into one shared trunk that
 * only splits apart right at each work center.
 */
function groupIntoComponents(edges: SystemEdgeInput[]): Map<string, string> {
  const parent = new Map<string, string>()
  const find = (x: string): string => {
    let root = x
    while (parent.get(root) !== root) root = parent.get(root) as string
    let cur = x
    while (parent.get(cur) !== root) {
      const next = parent.get(cur) as string
      parent.set(cur, root)
      cur = next
    }
    return root
  }
  const union = (a: string, b: string) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }
  const nodeKey = (category: string, node: string) => `${category}::${node}`

  for (const e of edges) {
    const a = nodeKey(e.category, e.source)
    const b = nodeKey(e.category, e.target)
    if (!parent.has(a)) parent.set(a, a)
    if (!parent.has(b)) parent.set(b, b)
    union(a, b)
  }

  const edgeToComponent = new Map<string, string>()
  for (const e of edges) {
    edgeToComponent.set(e.id, `${e.category}::${find(nodeKey(e.category, e.source))}`)
  }
  return edgeToComponent
}

/**
 * Routes the software/data overlay like a wiring loom: every connection taps
 * sideways out of its source node onto a vertical "bus" lane, runs the
 * lane's length, then taps back into the target node. Two things keep the
 * lines from overlapping or needlessly duplicating each other:
 *
 * 1. Connections are grouped into connected components (see
 *    groupIntoComponents above) — each component shares ONE lane, so a
 *    fan-out/fan-in cluster reads as a single trunk rather than N parallel
 *    lines. Components are still ordered by category first, so same-colored
 *    trunks land in adjacent lanes and read as a grouped band.
 * 2. Every connection touching a given node on a given side taps that
 *    node's actual left/right connect dot — the same one a manually-drawn
 *    connector uses (see PipelineNode.tsx) — rather than a point invented
 *    somewhere along its height. Multiple connections sharing that dot is
 *    intentional: they leave straight out of the real endpoint together and
 *    only fan apart once they reach their (possibly different) lanes.
 *
 * Node positions are taken as given (from elkLayout's process-flow-only
 * pass, or live drag positions from FlowCanvas) and never modified — this
 * only computes edge paths.
 */
export function routeSystemEdges(nodes: NodeBox[], edges: SystemEdgeInput[]): Map<string, RoutePoint[]> {
  const routes = new Map<string, RoutePoint[]>()
  if (nodes.length === 0) return routes

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const minX = Math.min(...nodes.map((n) => n.x))
  const maxX = Math.max(...nodes.map((n) => n.x + n.width))
  const sideOf = (category: string) => CATEGORY_SIDE[category] ?? 'right'
  const edgeComponent = groupIntoComponents(edges)

  // Deterministic order: side, then category, then component, then id —
  // this is what makes adjacent lanes belong to the same category (an
  // organized band) instead of an arbitrary interleave.
  const ordered = [...edges].sort((a, b) => {
    const sideA = sideOf(a.category)
    const sideB = sideOf(b.category)
    if (sideA !== sideB) return sideA === 'left' ? -1 : 1
    const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    if (catDiff !== 0) return catDiff
    const compDiff = (edgeComponent.get(a.id) ?? '').localeCompare(edgeComponent.get(b.id) ?? '')
    if (compDiff !== 0) return compDiff
    return a.id.localeCompare(b.id)
  })

  // One lane per COMPONENT, not per edge — every edge in the same component
  // reuses its component's lane the first time it's assigned.
  const componentLane = new Map<string, number>()
  const laneIndex = { left: 0, right: 0 }
  const laneXFor = (edge: SystemEdgeInput) => {
    const side = sideOf(edge.category)
    const component = edgeComponent.get(edge.id) ?? edge.id
    if (!componentLane.has(component)) {
      componentLane.set(component, laneIndex[side])
      laneIndex[side] += 1
    }
    const index = componentLane.get(component) as number
    return side === 'right' ? maxX + LANE_GAP + index * LANE_SPACING : minX - LANE_GAP - index * LANE_SPACING
  }

  for (const edge of ordered) {
    const source = byId.get(edge.source)
    const target = byId.get(edge.target)
    if (!source || !target) continue

    const side = sideOf(edge.category)
    const laneX = laneXFor(edge)
    const sourceTap = sideTapPoint(source, side)
    const targetTap = sideTapPoint(target, side)
    const sourceStub = stubPoint(sourceTap, side)
    const targetStub = stubPoint(targetTap, side)
    const endpointIds = new Set([edge.source, edge.target])

    // Any bending is only allowed to start at the stub, never at the tap
    // itself — that's what keeps the final approach into the dot straight.
    // If the straight run from stub to lane would cut across another node's
    // box (e.g. reaching past a sibling to a lane on the far side), step
    // around it instead: up/down to clear the whole row, then across.
    const sourceBlockers = findObstructions(nodes, endpointIds, sourceStub.y, sourceStub.x, laneX)
    const sourceLaneY = sourceBlockers.length > 0 ? clearanceY(sourceBlockers, sourceStub.y) : sourceStub.y

    const targetBlockers = findObstructions(nodes, endpointIds, targetStub.y, targetStub.x, laneX)
    const targetLaneY = targetBlockers.length > 0 ? clearanceY(targetBlockers, targetStub.y) : targetStub.y

    const points: RoutePoint[] = [sourceTap, sourceStub]
    if (sourceLaneY !== sourceStub.y) points.push({ x: sourceStub.x, y: sourceLaneY })
    points.push({ x: laneX, y: sourceLaneY })
    points.push({ x: laneX, y: targetLaneY })
    if (targetLaneY !== targetStub.y) points.push({ x: targetStub.x, y: targetLaneY })
    points.push(targetStub, targetTap)

    routes.set(edge.id, points)
  }

  return routes
}
