import { MarkerType, type Edge } from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import type { FlowNode } from './buildGraph'
import { layoutGraph } from './elkLayout'
import { routeSystemEdges } from './routeSystemEdges'
import { DEFAULT_HANDOFF_STYLE, HANDOFF_STYLE } from '../components/nodes/roleStyles'
import { nodeMatchesFilters, systemConnectionMatchesFilters, type FilterState } from './filters'
import { dasharrayForLineStyle } from './systemStyle'

/**
 * The data-driven layout: node positions from ELK for every node in
 * roadmapData.ts, tagged with expand/filter state, plus the software/data
 * overlay routed separately as a bus (see routeSystemEdges.ts). Pure
 * function of (data, expanded ids, filters, overlay flag) — user
 * drag/connect edits are merged in by the caller from localStorage. Async
 * because ELK's layout pass runs off the main thread.
 */
export async function computeBaseLayout(
  data: RoadmapData,
  expandedNodeIds: Set<string>,
  filters: FilterState,
  showSystemsOverlay: boolean,
) {
  const matches = new Map(data.nodes.map((n) => [n.id, nodeMatchesFilters(n, filters)]))

  const rawNodes: FlowNode[] = data.nodes.map((node) => ({
    id: node.id,
    type: 'pipelineNode',
    position: { x: 0, y: 0 },
    deletable: false,
    data: {
      node,
      expanded: expandedNodeIds.has(node.id),
      dimmed: !matches.get(node.id),
    },
  }))

  const positionedNodes = await layoutGraph(
    rawNodes,
    data.edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
  )

  const styledEdges: Edge[] = data.edges.map((e) => {
    const style = HANDOFF_STYLE[e.handoffType] ?? DEFAULT_HANDOFF_STYLE
    const dimmed = !matches.get(e.source) || !matches.get(e.target)
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      deletable: false,
      animated: e.animated,
      label: e.label,
      labelStyle: { fill: style.stroke, fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: '#fff' },
      style: {
        stroke: style.stroke,
        strokeWidth: 2,
        strokeDasharray: style.dashed ? '7 5' : undefined,
        opacity: dimmed ? 0.2 : 1,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: style.stroke },
    }
  })

  const systemEdges: Edge[] = showSystemsOverlay
    ? buildSystemEdges(data, filters, matches, positionedNodes)
    : []

  return { nodes: positionedNodes, edges: [...styledEdges, ...systemEdges] }
}

/**
 * Software/data overlay edges, per the System Connections sheet. These can
 * jump between non-adjacent nodes in different lanes (real cross-branch
 * system integration), unlike the base process-flow edges above. Routed as
 * a wiring-loom bus (see routeSystemEdges.ts) rather than a direct line, so
 * the ~44 connections stay legible instead of tangling through the middle
 * of the diagram.
 */
function buildSystemEdges(
  data: RoadmapData,
  filters: FilterState,
  matches: Map<string, boolean>,
  positionedNodes: FlowNode[],
): Edge[] {
  const boxes = positionedNodes.map((n) => ({
    id: n.id,
    x: n.position.x,
    y: n.position.y,
    width: typeof n.style?.width === 'number' ? n.style.width : 300,
    height: typeof n.style?.height === 'number' ? n.style.height : 112,
  }))
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
      // highlight just its own connections without re-running the layout.
      data: { points: routes.get(sc.id) ?? [], dasharray: dasharrayForLineStyle(sc.lineStyle), filterDimmed },
      style: { stroke: sc.lineColor, strokeWidth: sc.lineWidth },
      markerEnd: { type: MarkerType.ArrowClosed, color: sc.lineColor, width: 14, height: 14 },
    }
  })
}

export { HANDOFF_STYLE, DEFAULT_HANDOFF_STYLE }
export type { FilterState }
