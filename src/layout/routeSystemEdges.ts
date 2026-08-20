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
/** Keep tap points within the middle slice of a node's height, away from its header/badge. */
const TAP_MARGIN_FRACTION = 0.18
/** Clearance kept between a detoured line and the row of nodes it's stepping around. */
const CLEAR_MARGIN = 20

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
 * 2. Where several connections tap into the same node on the same side,
 *    their tap points are spread across that node's height instead of all
 *    converging on its exact center.
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

  // How many connections tap into each (node, side) pair — used to fan
  // their tap points out along the node's height.
  const tapTotal = new Map<string, number>()
  for (const e of ordered) {
    const side = sideOf(e.category)
    const sourceKey = `${e.source}:${side}`
    const targetKey = `${e.target}:${side}`
    tapTotal.set(sourceKey, (tapTotal.get(sourceKey) ?? 0) + 1)
    tapTotal.set(targetKey, (tapTotal.get(targetKey) ?? 0) + 1)
  }
  const tapSeen = new Map<string, number>()
  const nextTapY = (nodeId: string, side: 'left' | 'right', box: NodeBox) => {
    const key = `${nodeId}:${side}`
    const total = tapTotal.get(key) ?? 1
    const index = tapSeen.get(key) ?? 0
    tapSeen.set(key, index + 1)
    if (total <= 1) return box.y + box.height / 2
    const usable = box.height * (1 - TAP_MARGIN_FRACTION * 2)
    return box.y + box.height * TAP_MARGIN_FRACTION + (usable * index) / (total - 1)
  }

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
    const sourceY = nextTapY(edge.source, side, source)
    const targetY = nextTapY(edge.target, side, target)
    const sourceTapX = side === 'right' ? source.x + source.width : source.x
    const targetTapX = side === 'right' ? target.x + target.width : target.x
    const endpointIds = new Set([edge.source, edge.target])

    // A tap stub normally runs straight across, at the tap's own height, to
    // the lane. If that would cut across another node's box (e.g. reaching
    // past a sibling to a lane on the far side), step around it instead:
    // up/down to clear the whole row, then across.
    const sourceBlockers = findObstructions(nodes, endpointIds, sourceY, sourceTapX, laneX)
    const sourceLaneY = sourceBlockers.length > 0 ? clearanceY(sourceBlockers, sourceY) : sourceY

    const targetBlockers = findObstructions(nodes, endpointIds, targetY, targetTapX, laneX)
    const targetLaneY = targetBlockers.length > 0 ? clearanceY(targetBlockers, targetY) : targetY

    const points: RoutePoint[] = [{ x: sourceTapX, y: sourceY }]
    if (sourceLaneY !== sourceY) points.push({ x: sourceTapX, y: sourceLaneY })
    points.push({ x: laneX, y: sourceLaneY })
    points.push({ x: laneX, y: targetLaneY })
    if (targetLaneY !== targetY) points.push({ x: targetTapX, y: targetLaneY })
    points.push({ x: targetTapX, y: targetY })

    routes.set(edge.id, points)
  }

  return routes
}
