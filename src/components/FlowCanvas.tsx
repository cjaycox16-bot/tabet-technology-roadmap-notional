import { useCallback, useEffect, useImperativeHandle } from 'react'
import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import { computeBaseLayout } from '../layout/computeBaseLayout'
import type { FlowNode } from '../layout/buildGraph'
import { loadLayout, saveLayout, clearLayout, type StoredCustomEdge } from '../persistence/layoutStorage'
import { useRoadmap } from '../context/RoadmapContext'
import { PipelineNode } from './nodes/PipelineNode'

const nodeTypes = {
  pipelineNode: PipelineNode,
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

export function FlowCanvas({
  data,
  handleRef,
}: {
  data: RoadmapData
  handleRef?: React.RefObject<FlowCanvasHandle | null>
}) {
  const { expandedNodeIds, filters } = useRoadmap()
  const { fitView } = useReactFlow()
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState<FlowNode>([])
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState<Edge>([])

  const applyBaseLayout = useCallback(() => {
    const base = computeBaseLayout(data, expandedNodeIds, filters)
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
  }, [data, expandedNodeIds, filters, setNodes, setEdges])

  useEffect(() => {
    applyBaseLayout()
  }, [applyBaseLayout])

  useEffect(() => {
    // Re-fit whenever a node expands/collapses (its footprint changed) —
    // not on every drag, so dragging a node doesn't yank the viewport.
    const id = requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }))
    return () => cancelAnimationFrame(id)
  }, [expandedNodeIds, data, fitView])

  useImperativeHandle(handleRef, () => ({
    resetLayout: () => {
      clearLayout()
      applyBaseLayout()
    },
  }))

  const handleNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      onNodesChangeInternal(changes)
      for (const change of changes) {
        if (change.type === 'position' && change.dragging === false && change.position) {
          const stored = loadLayout()
          stored.positions[change.id] = change.position
          saveLayout(stored)
        }
      }
    },
    [onNodesChangeInternal],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChangeInternal(changes)
      const removedCustomIds = changes.filter((c) => c.type === 'remove').map((c) => c.id)
      if (removedCustomIds.length === 0) return
      const stored = loadLayout()
      stored.customEdges = stored.customEdges.filter((ce) => !removedCustomIds.includes(ce.id))
      saveLayout(stored)
    },
    [onEdgesChangeInternal],
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
    },
    [setEdges],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      onConnect={handleConnect}
      deleteKeyCode={['Backspace', 'Delete']}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.15}
    >
      <Background color="#D0DCE8" />
      <Controls />
    </ReactFlow>
  )
}
