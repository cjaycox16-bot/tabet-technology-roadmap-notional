import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FilterState } from '../layout/filters'
import {
  loadAnnotations,
  saveAnnotations,
  getAnnotation as getAnnotationFromStore,
  type AnnotationStore,
  type NodeAnnotation,
  type NodeEdits,
} from '../persistence/annotationStorage'

interface RoadmapContextValue {
  expandedNodeIds: Set<string>
  toggleNodeExpanded: (nodeId: string) => void
  expandAll: (nodeIds: string[]) => void
  collapseAll: () => void
  selectedNodeId: string | null
  selectNode: (nodeId: string | null) => void
  hoveredNodeId: string | null
  setHoveredNode: (nodeId: string | null) => void
  /** hoveredNodeId if set, else selectedNodeId — the stage whose system connections should be highlighted. */
  focusNodeId: string | null
  filters: FilterState
  toggleLane: (lane: string) => void
  toggleStatus: (status: string) => void
  toggleSystemCategory: (category: string) => void
  setSearch: (search: string) => void
  clearFilters: () => void
  showSystemsOverlay: boolean
  toggleSystemsOverlay: () => void
  /** When true, dragging from a stage's connect dots draws a manual connector; when false, dots are hidden and dragging a stage just moves it. */
  connectMode: boolean
  toggleConnectMode: () => void
  /** Per-stage validation/notes/edits — browser-local, layered on top of the Excel-sourced data. */
  annotations: AnnotationStore
  getAnnotation: (nodeId: string) => NodeAnnotation
  setValidated: (nodeId: string, validated: boolean) => void
  saveNotes: (nodeId: string, notes: string) => void
  saveEdits: (nodeId: string, edits: NodeEdits) => void
}

const RoadmapContext = createContext<RoadmapContextValue | null>(null)

export function RoadmapProvider({ children }: { children: ReactNode }) {
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set())
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [lanes, setLanes] = useState<Set<string>>(new Set())
  const [statuses, setStatuses] = useState<Set<string>>(new Set())
  const [systemCategories, setSystemCategories] = useState<Set<string>>(new Set())
  const [search, setSearchState] = useState('')
  const [showSystemsOverlay, setShowSystemsOverlay] = useState(true)
  // Off by default — dragging a stage to reposition it is the far more
  // common interaction, and with connect dots on all 4 sides + corners
  // (PipelineNode.tsx) there's no room on the card to grab that isn't also
  // a dot. Turning this on hides nothing about layout dragging; it only
  // reveals the dots so a drag from one can draw a connector instead.
  const [connectMode, setConnectMode] = useState(false)
  const [annotations, setAnnotationsState] = useState<AnnotationStore>(() => loadAnnotations())

  const updateAnnotation = (nodeId: string, patch: Partial<NodeAnnotation>) => {
    setAnnotationsState((prev) => {
      const next: AnnotationStore = { nodes: { ...prev.nodes, [nodeId]: { ...getAnnotationFromStore(prev, nodeId), ...patch } } }
      saveAnnotations(next)
      return next
    })
  }

  // Stable reference unless an actual filter selection changes. This must NOT
  // be rebuilt on every hover — FlowCanvas treats a new `filters` object as
  // "the filters changed, re-run the full layout," so bundling this with
  // hover/selection state caused every mouse-enter to trigger a full ELK
  // re-layout and viewport reset.
  const filters = useMemo<FilterState>(
    () => ({ lanes, statuses, systemCategories, search }),
    [lanes, statuses, systemCategories, search],
  )

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
      hoveredNodeId,
      setHoveredNode: setHoveredNodeId,
      focusNodeId: hoveredNodeId ?? selectedNodeId,
      filters,
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
      connectMode,
      toggleConnectMode: () => setConnectMode((prev) => !prev),
      annotations,
      getAnnotation: (nodeId: string) => getAnnotationFromStore(annotations, nodeId),
      setValidated: (nodeId: string, validated: boolean) => updateAnnotation(nodeId, { validated }),
      saveNotes: (nodeId: string, notes: string) =>
        updateAnnotation(nodeId, { notes, notesUpdatedAt: new Date().toISOString() }),
      saveEdits: (nodeId: string, edits: NodeEdits) => updateAnnotation(nodeId, { edits }),
    }),
    [expandedNodeIds, selectedNodeId, hoveredNodeId, filters, showSystemsOverlay, connectMode, annotations],
  )

  return <RoadmapContext.Provider value={value}>{children}</RoadmapContext.Provider>
}

export function useRoadmap() {
  const ctx = useContext(RoadmapContext)
  if (!ctx) throw new Error('useRoadmap must be used within a RoadmapProvider')
  return ctx
}
