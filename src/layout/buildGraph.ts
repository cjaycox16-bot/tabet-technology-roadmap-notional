import type { Node } from '@xyflow/react'
import type { RoadmapNode } from '../data/types'

export interface PipelineNodeData extends Record<string, unknown> {
  node: RoadmapNode
  expanded: boolean
  dimmed: boolean
}

export type FlowNode = Node<PipelineNodeData, 'pipelineNode'>
