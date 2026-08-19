import { MarkerType, type Edge } from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import { routeSystemEdges } from './routeSystemEdges'
import { nodeMatchesFilters, systemConnectionMatchesFilters, type FilterState } from './filters'
import { dasharrayForLineStyle } from './systemStyle'

export interface NodeBox {
  id: string
  x: number
  y: number
  width: number
  height: number
}

/**
 * Software/data overlay edges, per the System Connections sheet. Takes node
 * positions as a plain argument rather than reading them from a prior layout
 * pass — call this with the CURRENT node positions (including drag
 * overrides) so the bus routes track a dragged node instead of freezing at
 * wherever it was when the page first loaded.
 */
export function buildSystemFlowEdges(data: RoadmapData, filters: FilterState, boxes: NodeBox[]): Edge[] {
  const matches = new Map(data.nodes.map((n) => [n.id, nodeMatchesFilters(n, filters)]))
  const routes = routeSystemEdges(
    boxes,
    data.systemConnections.map((sc) => ({
      id: sc.id,
      source: sc.source,
      target: sc.target,
      category: sc.systemCategory,
    })),
  )

  return data.systemConnections.map((sc) => {
    const filterDimmed =
      !matches.get(sc.source) || !matches.get(sc.target) || !systemConnectionMatchesFilters(sc, filters)

    return {
      id: sc.id,
      source: sc.source,
      target: sc.target,
      type: 'systemRoute',
      deletable: false,
      selectable: false,
      animated: sc.animated,
      // Opacity/weight are computed live in RoutedEdge from hover/selection
      // state, not baked in here — that's what lets hovering a stage
      // highlight just its own connections without recomputing routes.
      data: { points: routes.get(sc.id) ?? [], dasharray: dasharrayForLineStyle(sc.lineStyle), filterDimmed },
      style: { stroke: sc.lineColor, strokeWidth: sc.lineWidth },
      markerEnd: { type: MarkerType.ArrowClosed, color: sc.lineColor, width: 14, height: 14 },
    }
  })
}
