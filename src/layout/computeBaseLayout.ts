import { MarkerType, type Edge } from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import type { FlowNode } from './buildGraph'
import { layoutGraph } from './dagreLayout'
import { DEFAULT_HANDOFF_STYLE, HANDOFF_STYLE } from '../components/nodes/roleStyles'
import { nodeMatchesFilters, systemConnectionMatchesFilters, type FilterState } from './filters'
import { dasharrayForLineStyle } from './systemStyle'

/**
 * The data-driven layout: node/edge positions from dagre for every node and
 * edge in roadmapData.ts, tagged with expand/filter state. Pure function of
 * (data, expanded ids, filters) — user drag/connect edits are merged in by
 * the caller from localStorage.
 */
export function computeBaseLayout(
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

  const systemEdges: Edge[] = showSystemsOverlay ? buildSystemEdges(data, filters, matches) : []

  return { nodes: positionedNodes, edges: [...styledEdges, ...systemEdges] }
}

/**
 * Software/data overlay edges, per the System Connections sheet. These can
 * jump between non-adjacent nodes in different lanes (real cross-branch
 * system integration), unlike the base process-flow edges above. Spread
 * across the three fan-out handles on each node so connections sharing an
 * endpoint don't stack exactly on top of one another.
 */
function buildSystemEdges(
  data: RoadmapData,
  filters: FilterState,
  matches: Map<string, boolean>,
): Edge[] {
  const outIndex = new Map<string, number>()
  const inIndex = new Map<string, number>()
  const nextIndex = (counter: Map<string, number>, key: string) => {
    const i = (counter.get(key) ?? 0) % 3
    counter.set(key, (counter.get(key) ?? 0) + 1)
    return i
  }

  return data.systemConnections.map((sc) => {
    const dimmed =
      !matches.get(sc.source) || !matches.get(sc.target) || !systemConnectionMatchesFilters(sc, filters)

    return {
      id: sc.id,
      source: sc.source,
      target: sc.target,
      sourceHandle: `sys-source-${nextIndex(outIndex, sc.source)}`,
      targetHandle: `sys-target-${nextIndex(inIndex, sc.target)}`,
      type: 'default',
      deletable: false,
      selectable: false,
      animated: sc.animated,
      style: {
        stroke: sc.lineColor,
        strokeWidth: sc.lineWidth,
        strokeDasharray: dasharrayForLineStyle(sc.lineStyle),
        opacity: dimmed ? 0.1 : 0.75,
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: sc.lineColor, width: 14, height: 14 },
      zIndex: dimmed ? 0 : 1,
    }
  })
}

export { HANDOFF_STYLE, DEFAULT_HANDOFF_STYLE }
export type { FilterState }
