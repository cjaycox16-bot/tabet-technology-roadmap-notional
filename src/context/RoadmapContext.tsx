import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FilterState } from '../layout/filters'

interface RoadmapContextValue {
  expandedNodeIds: Set<string>
  toggleNodeExpanded: (nodeId: string) => void
  expandAll: (nodeIds: string[]) => void
  collapseAll: () => void
  selectedNodeId: string | null
  selectNode: (nodeId: string | null) => void
  filters: FilterState
  toggleLane: (lane: string) => void
  toggleStatus: (status: string) => void
  toggleSystemCategory: (category: string) => void
  setSearch: (search: string) => void
  clearFilters: () => void
  showSystemsOverlay: boolean
  toggleSystemsOverlay: () => void
}

const RoadmapContext = createContext<RoadmapContextValue | null>(null)

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [lanes, setLanes] = useState<Set<string>>(new Set())
  const [statuses, setStatuses] = useState<Set<string>>(new Set())
  const [systemCategories, setSystemCategories] = useState<Set<string>>(new Set())
  const [search, setSearchState] = useState('')
  const [showSystemsOverlay, setShowSystemsOverlay] = useState(true)

  const value = useMemo<RoadmapContextValue>(
    () => ({
      expandedNodeIds,
      toggleNodeExpanded: (nodeId: string) => {
        setExpandedNodeIds((prev) => {
          const next = new Set(prev)
          if (next.has(nodeId)) next.delete(nodeId)
          else next.add(nodeId)
          return next
        })
      },
      expandAll: (nodeIds: string[]) => setExpandedNodeIds(new Set(nodeIds)),
      collapseAll: () => setExpandedNodeIds(new Set()),
      selectedNodeId,
      selectNode: setSelectedNodeId,
      filters: { lanes, statuses, systemCategories, search },
      toggleLane: (lane: string) => {
        setLanes((prev) => {
          const next = new Set(prev)
          if (next.has(lane)) next.delete(lane)
          else next.add(lane)
          return next
        })
      },
      toggleStatus: (status: string) => {
        setStatuses((prev) => {
          const next = new Set(prev)
          if (next.has(status)) next.delete(status)
          else next.add(status)
          return next
        })
      },
      toggleSystemCategory: (category: string) => {
        setSystemCategories((prev) => {
          const next = new Set(prev)
          if (next.has(category)) next.delete(category)
          else next.add(category)
          return next
        })
      },
      setSearch: setSearchState,
      clearFilters: () => {
        setLanes(new Set())
        setStatuses(new Set())
        setSystemCategories(new Set())
        setSearchState('')
      },
      showSystemsOverlay,
      toggleSystemsOverlay: () => setShowSystemsOverlay((prev) => !prev),
    }),
    [expandedNodeIds, selectedNodeId, lanes, statuses, systemCategories, search, showSystemsOverlay],
  )

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext)
  if (!ctx) throw new Error('useRoadmap must be used within a RoadmapProvider')
  return ctx
}
