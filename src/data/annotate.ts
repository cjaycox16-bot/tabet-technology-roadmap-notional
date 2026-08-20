import type { RoadmapNode } from './types'
import type { NodeEdits } from '../persistence/annotationStorage'

/** Applies saved edit overrides on top of the Excel-sourced node — the effective node to render anywhere in the app. */
export function applyEdits(node: RoadmapNode, edits: NodeEdits | undefined): RoadmapNode {
  if (!edits) return node
  return {
    ...node,
    label: edits.label ?? node.label,
    detailTitle: edits.detailTitle ?? node.detailTitle,
    inputsSummary: edits.inputsSummary ?? node.inputsSummary,
    outputsSummary: edits.outputsSummary ?? node.outputsSummary,
    process: { ...node.process, ...edits.process },
    software: node.software.map((s) => ({ ...s, ...edits.software?.[s.category] })),
  }
}
