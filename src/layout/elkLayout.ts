import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode } from 'elkjs/lib/elk-api'
import { Position } from '@xyflow/react'
import type { FlowNode } from './buildGraph'

export const NODE_WIDTH = 300
export const COLLAPSED_HEIGHT = 112
export const EXPANDED_HEIGHT = 322

export function nodeHeight(expanded: boolean): number {
  return expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT
}

const elk = new ELK()

interface StructuralEdgeInput {
  id: string
  source: string
  target: string
}

/**
 * Top-to-bottom layout driven only by the process-flow edges (a plain DAG,
 * same as the shop-floor Mermaid chart). Re-run on every expand/collapse
 * with updated heights so ELK pushes downstream nodes out of the way itself.
 *
 * The software/data overlay is routed separately (see routeSystemEdges.ts)
 * rather than fed into this same pass — the overlay includes real feedback
 * loops (e.g. Shipping back to Sales) that, once mixed into one ranking
 * pass, drag ELK's cycle-breaking into reordering the primary pipeline
 * itself. Keeping the two concerns apart keeps this shape stable.
 */
export async function layoutGraph(nodes: FlowNode[], structuralEdges: StructuralEdgeInput[]): Promise<FlowNode[]> {
  const children: ElkNode[] = nodes.map((node) => ({
    id: node.id,
    width: NODE_WIDTH,
    height: nodeHeight(node.data.expanded),
  }))

  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
      'elk.spacing.nodeNode': '64',
    },
    children,
    edges: structuralEdges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  }

  const result = await elk.layout(graph)
  const positioned = new Map((result.children ?? []).map((c) => [c.id, c]))

  return nodes.map((node) => {
    const pos = positioned.get(node.id)
    const height = nodeHeight(node.data.expanded)
    return {
      ...node,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      position: { x: pos?.x ?? 0, y: pos?.y ?? 0 },
      style: { width: NODE_WIDTH, height },
    }
  })
}
