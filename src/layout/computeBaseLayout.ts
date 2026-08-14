import { MarkerType, type Edge } from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import type { FlowNode } from './buildGraph'
import { layoutGraph } from './dagreLayout'
import { DEFAULT_HANDOFF_STYLE, HANDOFF_STYLE } from '../components/nodes/roleStyles'
import { nodeMatchesFilters, type FilterState } from './filters'

/**
 * The data-driven layout: node/edge positions from dagre for every node and
 * edge in roadmapData.ts, tagged with expand/filter state. Pure function of
 * (data, expanded ids, filters) — user drag/connect edits are merged in by
 * the caller from localStorage.
 */
export function computeBaseLayout(data: RoadmapData, expandedNodeIds: Set<string>, filters: FilterState) {
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

  const structuralEdges: Edge[] = data.edges.map((e) => ({ id: e.id, source: e.source, target: e.target }))
  const positionedNodes = layoutGraph(rawNodes, structuralEdges)

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

  return { nodes: positionedNodes, edges: styledEdges }
}

export { HANDOFF_STYLE, DEFAULT_HANDOFF_STYLE }
export type { FilterState }
