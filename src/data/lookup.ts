import type { RoadmapData, RoadmapNode } from './types'

export function findNode(data: RoadmapData, id: string): RoadmapNode | undefined {
  return data.nodes.find((n) => n.id === id)
}

/** A field is workbook boilerplate until someone at Tabet fills it in. */
export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return true
  return value.trim().toUpperCase().startsWith('PLACEHOLDER')
}
