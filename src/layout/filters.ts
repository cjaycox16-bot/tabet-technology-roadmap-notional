import type { RoadmapNode, SystemConnection } from '../data/types'

export interface FilterState {
  lanes: Set<string>
  statuses: Set<string>
  systemCategories: Set<string>
  search: string
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.lanes.size > 0 ||
    filters.statuses.size > 0 ||
    filters.systemCategories.size > 0 ||
    filters.search.trim().length > 0
  )
}

/** True when a node should be highlighted (full opacity) under the current filters. */
export function nodeMatchesFilters(node: RoadmapNode, filters: FilterState): boolean {
  if (filters.lanes.size > 0 && !filters.lanes.has(node.lane)) return false
  if (filters.statuses.size > 0 && !filters.statuses.has(node.status)) return false
  const q = filters.search.trim().toLowerCase()
  if (q.length > 0) {
    const haystack = [
      node.label,
      node.lane,
      node.role,
      ...node.software.map((s) => s.category),
      ...node.software.map((s) => s.packageName),
    ]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}

/** True when a software/data overlay connection should be highlighted under the current filters. */
export function systemConnectionMatchesFilters(connection: SystemConnection, filters: FilterState): boolean {
  if (filters.systemCategories.size > 0 && !filters.systemCategories.has(connection.systemCategory)) return false
  const q = filters.search.trim().toLowerCase()
  if (q.length > 0) {
    const haystack = [connection.systemName, connection.systemCategory, connection.dataTransmitted]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
}
