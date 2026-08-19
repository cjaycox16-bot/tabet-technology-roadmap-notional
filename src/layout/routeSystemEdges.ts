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
 * category (never split) so same-colored lines stay visually grouped, with
 * the two sides roughly balanced by total connection count: ERP/MRP alone
 * is 19 of the 44 connections, so it's paired with QMS on the right (24)
 * against the other three categories on the left (20).
 */
const CATEGORY_SIDE: Record<string, 'left' | 'right'> = {
  'ERP/MRP System': 'right',
  'QMS / Compliance': 'right',
  'Department Software': 'left',
  'Spreadsheet/Tracker': 'left',
  'AI/Automation': 'left',
}

const LANE_GAP = 36
const LANE_SPACING = 15
/** Keep tap points within the middle slice of a node's height, away from its header/badge. */
const TAP_MARGIN_FRACTION = 0.18

/**
 * Routes the software/data overlay like a wiring loom: every connection taps
 * sideways out of its source node onto a vertical "bus" lane, runs the
 * lane's length, then taps back into the target node. Two things keep the
 * ~44 lines from overlapping each other, which a shared-lane-per-category
 * approach doesn't manage on its own:
 *
 * 1. Every single connection gets its OWN exclusive lane — never shared
 *    with another edge, even within the same category — so two lines can
 *    never trace the same path. Lanes are still ordered by category first,
 *    so same-colored connections land in adjacent lanes and read as a
 *    grouped band rather than a strictly single shared line.
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

  // Deterministic order: side, then category, then id — this is what makes
  // adjacent lanes belong to the same category (an organized band) instead
  // of an arbitrary interleave.
  const ordered = [...edges].sort((a, b) => {
    const sideA = sideOf(a.category)
    const sideB = sideOf(b.category)
    if (sideA !== sideB) return sideA === 'left' ? -1 : 1
    const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
    if (catDiff !== 0) return catDiff
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

  const laneIndex = { left: 0, right: 0 }

  for (const edge of ordered) {
    const source = byId.get(edge.source)
    const target = byId.get(edge.target)
    if (!source || !target) continue

    const side = sideOf(edge.category)
    const laneX =
      side === 'right'
        ? maxX + LANE_GAP + laneIndex.right * LANE_SPACING
        : minX - LANE_GAP - laneIndex.left * LANE_SPACING
    laneIndex[side] += 1

    const sourceY = nextTapY(edge.source, side, source)
    const targetY = nextTapY(edge.target, side, target)
    const sourceTapX = side === 'right' ? source.x + source.width : source.x
    const targetTapX = side === 'right' ? target.x + target.width : target.x

    routes.set(edge.id, [
      { x: sourceTapX, y: sourceY },
      { x: laneX, y: sourceY },
      { x: laneX, y: targetY },
      { x: targetTapX, y: targetY },
    ])
  }

  return routes
}
