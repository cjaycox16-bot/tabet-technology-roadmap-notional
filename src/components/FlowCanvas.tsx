import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useUpdateNodeInternals,
  type Connection,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type XYPosition,
} from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import { computeBaseLayout } from '../layout/computeBaseLayout'
import { buildSystemFlowEdges } from '../layout/systemFlowEdges'
import type { FlowNode } from '../layout/buildGraph'
import { loadLayout, saveLayout, clearLayout, type StoredCustomEdge } from '../persistence/layoutStorage'
import { loadLaneOffsets, saveLaneOffsets, clearLaneOffsets } from '../persistence/laneOffsetStorage'
import {
  loadSystemEndpointOverrides,
  saveSystemEndpointOverrides,
  clearSystemEndpointOverrides,
  type SystemEndpointOverrides,
} from '../persistence/systemEndpointStorage'
import { useRoadmap } from '../context/RoadmapContext'
import { PipelineNode } from './nodes/PipelineNode'
import { RoutedEdge } from './edges/RoutedEdge'
import { ProcessEdge } from './edges/ProcessEdge'
import { ROLE_STYLE } from './nodes/roleStyles'
import { buildSystemCategoryStyles, type SystemCategoryStyle } from '../layout/systemStyle'

const nodeTypes = {
  pipelineNode: PipelineNode,
}

const edgeTypes = {
  systemRoute: RoutedEdge,
  processEdge: ProcessEdge,
}

const CUSTOM_EDGE_STYLE = { stroke: '#0AACE0', strokeWidth: 2, strokeDasharray: '2 5' }

/**
 * A manually-drawn connector with a category selected (App.tsx's picker,
 * shown while "Draw connectors" mode is on) is styled like that category's
 * real system/data-flow lines instead of the generic teal-dashed default —
 * `categoryStyles` comes from the same `buildSystemCategoryStyles` the
 * Legend uses, so the two always agree.
 */
function customEdgeToFlowEdge(ce: StoredCustomEdge, categoryStyles: Map<string, SystemCategoryStyle>): Edge {
  const categoryStyle = ce.category ? categoryStyles.get(ce.category) : undefined
  const stroke = categoryStyle?.stroke ?? CUSTOM_EDGE_STYLE.stroke
  const style = categoryStyle
    ? { stroke: categoryStyle.stroke, strokeWidth: 2, strokeDasharray: categoryStyle.dasharray }
    : CUSTOM_EDGE_STYLE
  return {
    id: ce.id,
    source: ce.source,
    sourceHandle: ce.sourceHandle,
    target: ce.target,
    targetHandle: ce.targetHandle,
    type: 'smoothstep',
    deletable: true,
    animated: categoryStyle?.animated ?? false,
    style,
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
  }
}

export interface FlowCanvasHandle {
  resetLayout: () => void
}

/** The two kinds of state change Ctrl+Z can revert — everything persisted to layoutStorage. */
type UndoAction =
  | { kind: 'move'; moves: { nodeId: string; from: XYPosition }[] }
  | { kind: 'addEdge'; edge: StoredCustomEdge }
  | { kind: 'removeEdge'; edge: StoredCustomEdge }

const UNDO_LIMIT = 50

export function FlowCanvas({
  data,
  handleRef,
}: {
  data: RoadmapData
  handleRef?: React.RefObject<FlowCanvasHandle | null>
}) {
  const { expandedNodeIds, filters, showSystemsOverlay, connectMode, connectorCategory } = useRoadmap()
  const { fitView } = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<Edge>([])
  // ELK's layout pass is async — guard against an older request resolving
  // after a newer one (e.g. rapid expand/collapse clicks).
  const layoutRequestId = useRef(0)

  // Ctrl+Z support. dragStartPositions captures where a node was when its
  // drag began (set in onNodeDragStart, read in onNodeDragStop) since
  // NodeChange events only ever carry the node's current position, never
  // where it started.
  const undoStack = useRef<UndoAction[]>([])
  const dragStartPositions = useRef(new Map<string, XYPosition>())

  const [laneOffsets, setLaneOffsets] = useState(() => loadLaneOffsets())
  const nudgeLane = useCallback((laneKey: string, deltaX: number) => {
    setLaneOffsets((prev) => {
      const next = { ...prev, [laneKey]: (prev[laneKey] ?? 0) + deltaX }
      saveLaneOffsets(next)
      return next
    })
  }, [])

  const [endpointOverrides, setEndpointOverrides] = useState<SystemEndpointOverrides>(() =>
    loadSystemEndpointOverrides(),
  )
  const retargetSystemEdge = useCallback((connectionId: string, end: 'source' | 'target', newNodeId: string) => {
    setEndpointOverrides((prev) => {
      const next = { ...prev, [connectionId]: { ...prev[connectionId], [end]: newNodeId } }
      saveSystemEndpointOverrides(next)
      return next
    })
  }, [])

  // Same reuse-the-Legend's-derivation pattern as Legend.tsx — keeps a
  // manually-drawn connector's category-styled look in sync with the actual
  // system/data-flow lines of that category.
  const categoryStyles = useMemo(
    () => new Map(buildSystemCategoryStyles(data.systemConnections).map((s) => [s.category, s])),
    [data],
  )

  const pushUndo = useCallback((action: UndoAction) => {
    undoStack.current.push(action)
    if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift()
  }, [])

  const applyBaseLayout = useCallback(() => {
    const requestId = ++layoutRequestId.current
    computeBaseLayout(data, expandedNodeIds, filters).then((base) => {
      if (requestId !== layoutRequestId.current) return

      const stored = loadLayout()
      const visibleIds = new Set(base.nodes.map((n) => n.id))

      const mergedNodes = base.nodes.map((node) => {
        const override = stored.positions[node.id]
        return override ? { ...node, position: override } : node
      })
      const customEdges = stored.customEdges
        .filter((ce) => visibleIds.has(ce.source) && visibleIds.has(ce.target))
        .map((ce) => customEdgeToFlowEdge(ce, categoryStyles))

      setNodes(mergedNodes)
      setEdges([...base.edges, ...customEdges])
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }))
    })
  }, [data, expandedNodeIds, filters, categoryStyles, setNodes, setEdges, fitView])

  useEffect(() => {
    applyBaseLayout()
  }, [applyBaseLayout])

  // Toggling connectMode mounts/unmounts 6 of each node's 8 handles
  // (PipelineNode.tsx). React Flow only measures a node's handle positions
  // on its own mount — adding handles to an already-mounted node doesn't
  // register them, so connections silently failed to start or land on them
  // until told to re-measure.
  useEffect(() => {
    for (const node of nodes) updateNodeInternals(node.id)
    // Depends on nodes.length rather than `nodes` itself so this only fires
    // on the connectMode flip (or the node count changing), not on every
    // position update while a node is mid-drag.
  }, [connectMode, nodes.length, updateNodeInternals])

  // Recomputed from whatever the CURRENT node positions are (including drag
  // overrides), not from the layout pass above — that's what makes the
  // overlay follow a dragged node instead of freezing at its original spot.
  // Kept out of the `edges` state entirely: these are derived and read-only
  // (deletable: false, selectable: false), not something React Flow needs
  // to track independently.
  const systemEdges = useMemo(() => {
    if (!showSystemsOverlay || nodes.length === 0) return []
    const boxes = nodes.map((n) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      width: typeof n.style?.width === 'number' ? n.style.width : 300,
      height: typeof n.style?.height === 'number' ? n.style.height : 112,
    }))
    return buildSystemFlowEdges(data, filters, boxes, {
      laneOffsets,
      onNudgeLane: nudgeLane,
      endpointOverrides,
      onRetargetEndpoint: retargetSystemEdge,
    })
  }, [data, filters, showSystemsOverlay, nodes, laneOffsets, nudgeLane, endpointOverrides, retargetSystemEdge])

  const renderedEdges = useMemo(() => [...edges, ...systemEdges], [edges, systemEdges])

  useImperativeHandle(handleRef, () => ({
    resetLayout: () => {
      clearLayout()
      clearLaneOffsets()
      setLaneOffsets({})
      clearSystemEndpointOverrides()
      setEndpointOverrides({})
      undoStack.current = []
      dragStartPositions.current.clear()
      applyBaseLayout()
    },
  }))

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      onNodesChangeInternal(changes)
      const moves: { nodeId: string; from: XYPosition }[] = []
      let stored: ReturnType<typeof loadLayout> | null = null
      for (const change of changes) {
        if (change.type === 'position' && change.dragging === false && change.position) {
          stored ??= loadLayout()
          const from = dragStartPositions.current.get(change.id)
          dragStartPositions.current.delete(change.id)
          if (from && (from.x !== change.position.x || from.y !== change.position.y)) {
            moves.push({ nodeId: change.id, from })
          }
          stored.positions[change.id] = change.position
        }
      }
      if (!stored) return
      saveLayout(stored)
      // One undo action for the whole group — a multi-select drag (Ctrl+click
      // several stages, then drag any one) moves every selected stage at
      // once, so a single Ctrl+Z should put all of them back, not just one.
      if (moves.length > 0) pushUndo({ kind: 'move', moves })
    },
    [onNodesChangeInternal, pushUndo],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes)
      const removedIds = changes.filter((c) => c.type === 'remove').map((c) => c.id)
      if (removedIds.length === 0) return
      const stored = loadLayout()
      const removed = stored.customEdges.filter((ce) => removedIds.includes(ce.id))
      for (const ce of removed) pushUndo({ kind: 'removeEdge', edge: ce })
      stored.customEdges = stored.customEdges.filter((ce) => !removedIds.includes(ce.id))
      saveLayout(stored)
    },
    [onEdgesChangeInternal, pushUndo],
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      const customEdge: StoredCustomEdge = {
        id: `custom-${crypto.randomUUID()}`,
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        target: connection.target,
        targetHandle: connection.targetHandle,
        category: connectorCategory ?? undefined,
      }
      setEdges((eds) => addEdge(customEdgeToFlowEdge(customEdge, categoryStyles), eds))
      const stored = loadLayout()
      stored.customEdges.push(customEdge)
      saveLayout(stored)
      pushUndo({ kind: 'addEdge', edge: customEdge })
    },
    [setEdges, pushUndo, connectorCategory, categoryStyles],
  )

  const undo = useCallback(() => {
    const action = undoStack.current.pop()
    if (!action) return
    if (action.kind === 'move') {
      const fromById = new Map(action.moves.map((m) => [m.nodeId, m.from]))
      setNodes((nds) => nds.map((n) => (fromById.has(n.id) ? { ...n, position: fromById.get(n.id)! } : n)))
      const stored = loadLayout()
      for (const m of action.moves) stored.positions[m.nodeId] = m.from
      saveLayout(stored)
    } else if (action.kind === 'addEdge') {
      setEdges((eds) => eds.filter((e) => e.id !== action.edge.id))
      const stored = loadLayout()
      stored.customEdges = stored.customEdges.filter((ce) => ce.id !== action.edge.id)
      saveLayout(stored)
    } else {
      setEdges((eds) => addEdge(customEdgeToFlowEdge(action.edge, categoryStyles), eds))
      const stored = loadLayout()
      stored.customEdges.push(action.edge)
      saveLayout(stored)
    }
  }, [setNodes, setEdges, categoryStyles])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'z' || !(event.ctrlKey || event.metaKey) || event.shiftKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      event.preventDefault()
      undo()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo])

  return (
    <ReactFlow
      className={connectMode ? 'connect-mode' : undefined}
      nodes={nodes}
      edges={renderedEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesConnectable={connectMode}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={handleConnect}
      onNodeDragStart={(_event, _node, draggedNodes) => {
        // Third param is every node moving in this drag, not just the one
        // the gesture started on — a Ctrl-selected group included.
        for (const n of draggedNodes) dragStartPositions.current.set(n.id, n.position)
      }}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.1}
    >
      <Background color="#D0DCE8" />
      <Controls />
      <MiniMap
        pannable
        zoomable
        position="top-right"
        maskColor="rgba(9, 41, 95, 0.06)"
        nodeColor={(node) => ROLE_STYLE[(node as FlowNode).data.node.role]?.accent ?? '#94A3B8'}
      />
    </ReactFlow>
  )
}
