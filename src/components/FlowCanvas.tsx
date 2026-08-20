import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import {
  addEdge,
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
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
import { useRoadmap } from '../context/RoadmapContext'
import { PipelineNode } from './nodes/PipelineNode'
import { RoutedEdge } from './edges/RoutedEdge'
import { ProcessEdge } from './edges/ProcessEdge'
import { ROLE_STYLE } from './nodes/roleStyles'

const nodeTypes = {
  pipelineNode: PipelineNode,
}

const edgeTypes = {
  systemRoute: RoutedEdge,
  processEdge: ProcessEdge,
}

const CUSTOM_EDGE_STYLE = { stroke: '#0AACE0', strokeWidth: 2, strokeDasharray: '2 5' }

function customEdgeToFlowEdge(ce: StoredCustomEdge): Edge {
  return {
    id: ce.id,
    source: ce.source,
    sourceHandle: ce.sourceHandle,
    target: ce.target,
    targetHandle: ce.targetHandle,
    type: 'smoothstep',
    deletable: true,
    style: CUSTOM_EDGE_STYLE,
    markerEnd: { type: MarkerType.ArrowClosed, color: CUSTOM_EDGE_STYLE.stroke },
  }
}

export interface FlowCanvasHandle {
  resetLayout: () => void
}

/** The two kinds of state change Ctrl+Z can revert — everything persisted to layoutStorage. */
type UndoAction =
  | { kind: 'move'; nodeId: string; from: XYPosition }
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
  const { expandedNodeIds, filters, showSystemsOverlay } = useRoadmap()
  const { fitView } = useReactFlow()
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
        .map(customEdgeToFlowEdge)

      setNodes(mergedNodes)
      setEdges([...base.edges, ...customEdges])
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }))
    })
  }, [data, expandedNodeIds, filters, setNodes, setEdges, fitView])

  useEffect(() => {
    applyBaseLayout()
  }, [applyBaseLayout])

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
    return buildSystemFlowEdges(data, filters, boxes)
  }, [data, filters, showSystemsOverlay, nodes])

  const renderedEdges = useMemo(() => [...edges, ...systemEdges], [edges, systemEdges])

  useImperativeHandle(handleRef, () => ({
    resetLayout: () => {
      clearLayout()
      undoStack.current = []
      dragStartPositions.current.clear()
      applyBaseLayout()
    },
  }))

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      onNodesChangeInternal(changes)
      for (const change of changes) {
        if (change.type === 'position' && change.dragging === false && change.position) {
          const from = dragStartPositions.current.get(change.id)
          dragStartPositions.current.delete(change.id)
          if (from && (from.x !== change.position.x || from.y !== change.position.y)) {
            pushUndo({ kind: 'move', nodeId: change.id, from })
          }
          const stored = loadLayout()
          stored.positions[change.id] = change.position
          saveLayout(stored)
        }
      }
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
      }
      setEdges((eds) => addEdge(customEdgeToFlowEdge(customEdge), eds))
      const stored = loadLayout()
      stored.customEdges.push(customEdge)
      saveLayout(stored)
      pushUndo({ kind: 'addEdge', edge: customEdge })
    },
    [setEdges, pushUndo],
  )

  const undo = useCallback(() => {
    const action = undoStack.current.pop()
    if (!action) return
    if (action.kind === 'move') {
      setNodes((nds) => nds.map((n) => (n.id === action.nodeId ? { ...n, position: action.from } : n)))
      const stored = loadLayout()
      stored.positions[action.nodeId] = action.from
      saveLayout(stored)
    } else if (action.kind === 'addEdge') {
      setEdges((eds) => eds.filter((e) => e.id !== action.edge.id))
      const stored = loadLayout()
      stored.customEdges = stored.customEdges.filter((ce) => ce.id !== action.edge.id)
      saveLayout(stored)
    } else {
      setEdges((eds) => addEdge(customEdgeToFlowEdge(action.edge), eds))
      const stored = loadLayout()
      stored.customEdges.push(action.edge)
      saveLayout(stored)
    }
  }, [setNodes, setEdges])

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
      nodes={nodes}
      edges={renderedEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      connectionMode={ConnectionMode.Loose}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={handleConnect}
      onNodeDragStart={(_event, node) => dragStartPositions.current.set(node.id, node.position)}
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
