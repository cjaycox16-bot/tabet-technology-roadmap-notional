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

/** Determines which of the five colored "bus" lanes a category runs in — keeps same-category lines grouped together. */
const CATEGORY_ORDER = [
  'ERP/MRP System',
  'Department Software',
  'Spreadsheet/Tracker',
  'QMS / Compliance',
  'AI/Automation',
]

const LANE_GAP = 40
const LANE_SPACING = 22

/**
 * Routes the software/data overlay like a wiring loom: every connection taps
 * out of its source node sideways onto a straight vertical "bus" lane (one
 * per system category, so same-colored lines group together), runs the
 * lane's length, then taps back into the target node. This is deliberately
 * NOT a shortest-path or crossing-minimized route — with ERP/MRP alone
 * touching all 18 stages, any attempt to draw 44 individually-routed lines
 * through the middle of the diagram reads as a tangle no matter how well
 * they're routed. A shared bus per category, running alongside the main
 * flow rather than through it, is what stays legible at this connection
 * count (the same convention wiring diagrams and subway maps use).
 *
 * Node positions are taken as given (from elkLayout's process-flow-only
 * pass) and never modified — this only computes edge paths.
 */
export function routeSystemEdges(nodes: NodeBox[], edges: SystemEdgeInput[]): Map<string, RoutePoint[]> {
  const routes = new Map<string, RoutePoint[]>()
  if (nodes.length === 0) return routes

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const minX = Math.min(...nodes.map((n) => n.x))
  const maxX = Math.max(...nodes.map((n) => n.x + n.width))
  const centerX = (minX + maxX) / 2

  for (const edge of edges) {
    const source = byId.get(edge.source)
    const target = byId.get(edge.target)
    if (!source || !target) continue

    const sourceCenterX = source.x + source.width / 2
    const targetCenterX = target.x + target.width / 2
    const side: 'left' | 'right' = sourceCenterX + targetCenterX < centerX * 2 ? 'left' : 'right'

    const categoryIndex = Math.max(0, CATEGORY_ORDER.indexOf(edge.category))
    const laneX =
      side === 'right'
        ? maxX + LANE_GAP + categoryIndex * LANE_SPACING
        : minX - LANE_GAP - categoryIndex * LANE_SPACING

    const sourceY = source.y + source.height / 2
    const targetY = target.y + target.height / 2
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
