import { MarkerType, type Edge } from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import type { FlowNode } from './buildGraph'
import { layoutGraph } from './elkLayout'
import { DEFAULT_HANDOFF_STYLE, HANDOFF_STYLE } from '../components/nodes/roleStyles'
import { nodeMatchesFilters, type FilterState } from './filters'

/**
 * Node positions (from ELK, driven by the process-flow edges only) and the
 * process-flow edges themselves, tagged with expand/filter state. Pure
 * function of (data, expanded ids, filters). Async because ELK's layout
 * pass runs off the main thread.
 *
 * The software/data overlay is intentionally NOT built here — see
 * systemFlowEdges.ts, which FlowCanvas recomputes live from current node
 * positions (including drag overrides) so the overlay tracks a dragged node
 * instead of freezing at these initial-layout coordinates.
 */
export async function computeBaseLayout(data: RoadmapData, expandedNodeIds: Set<string>, filters: FilterState) {
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
      // Explicit — nodes now carry 8 handles for freeform manual connectors
      // (see PipelineNode.tsx), so an edge with no handle id would otherwise
      // resolve to an arbitrary one instead of the vertical top/bottom pair
      // the process flow is laid out around.
      sourceHandle: 'bottom',
      target: e.target,
      targetHandle: 'top',
      type: 'processEdge',
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

  return { nodes: positionedNodes, edges: styledEdges }
}

export { HANDOFF_STYLE, DEFAULT_HANDOFF_STYLE }
export type { FilterState }
