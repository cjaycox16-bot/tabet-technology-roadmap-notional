import Dagre from '@dagrejs/dagre'
import { Position, type Edge } from '@xyflow/react'
import type { FlowNode } from './buildGraph'

export const NODE_WIDTH = 300
export const COLLAPSED_HEIGHT = 112
export const EXPANDED_HEIGHT = 322

export function nodeHeight(expanded: boolean): number {
  return expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT
}

/**
 * Single top-to-bottom pass over the whole pipeline. Re-run on every
 * expand/collapse toggle with updated heights so dagre pushes downstream
 * nodes out of the way itself — no separate re-flow logic needed.
 */
export function layoutGraph(nodes: FlowNode[], edges: Edge[]): FlowNode[] {
  const g = new Dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'TB', nodesep: 64, ranksep: 90 })

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: nodeHeight(node.data.expanded) })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  Dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    const height = nodeHeight(node.data.expanded)
    return {
      ...node,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - height / 2 },
      style: { width: NODE_WIDTH, height },
    }
  })
}
