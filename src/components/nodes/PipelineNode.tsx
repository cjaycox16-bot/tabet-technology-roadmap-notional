import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../layout/buildGraph'
import { useRoadmap } from '../../context/RoadmapContext'
import { isPlaceholder } from '../../data/lookup'
import { ROLE_STYLE, STATUS_STYLE } from './roleStyles'
import { Badge } from '../ui/badge'

type PipelineNodeProps = NodeProps<Extract<FlowNode, { type: 'pipelineNode' }>>

/** How far in from each corner the diagonal connect points sit, as a % of the node's width/height. */
const CORNER_INSET = '14%'
const CORNER_FAR = `calc(100% - 14%)`

export function PipelineNode({ data }: PipelineNodeProps) {
  const { selectNode, toggleNodeExpanded, setHoveredNode } = useRoadmap()
  const { node, expanded, dimmed } = data
  const role = ROLE_STYLE[node.role]
  const status = STATUS_STYLE[node.status]

  return (
    // Handles live in this unclipped wrapper rather than the rounded card
    // below — overflow-hidden on the card (needed to keep its tinted header
    // inside the rounded corners) would otherwise clip the half of each dot
    // that sits outside the border. connectionMode="loose" on <ReactFlow>
    // (FlowCanvas.tsx) is what lets every one of these act as either end of
    // a dragged connection, not just the semantic top/bottom pair.
    <div className="relative h-full w-full">
      <Handle id="top" type="target" position={Position.Top} />
      <Handle id="top-left" type="source" position={Position.Top} style={{ left: CORNER_INSET }} />
      <Handle id="top-right" type="source" position={Position.Top} style={{ left: CORNER_FAR }} />
      <Handle id="right" type="source" position={Position.Right} />
      <Handle id="bottom-right" type="source" position={Position.Bottom} style={{ left: CORNER_FAR }} />
      <Handle id="bottom" type="source" position={Position.Bottom} />
      <Handle id="bottom-left" type="source" position={Position.Bottom} style={{ left: CORNER_INSET }} />
      <Handle id="left" type="source" position={Position.Left} />

      <div
        className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-[opacity,box-shadow] hover:shadow-md"
        style={{ borderColor: role.accent, opacity: dimmed ? 0.25 : 1 }}
        onClick={() => selectNode(node.id)}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className="flex items-start gap-2 px-3 pt-2.5" style={{ background: role.tint }}>
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white"
            style={{ background: role.accent }}
          >
            {node.key}
          </span>
          <div className="min-w-0 flex-1 pb-2">
            <p className="line-clamp-2 text-[13px] font-semibold leading-tight text-[#0B1523]">{node.label}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: role.accent }}>
              {role.label}
            </p>
          </div>
          <button
            type="button"
            aria-label={expanded ? 'Collapse node' : 'Expand node'}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#D0DCE8] bg-white text-[11px] font-bold text-[#3D5168] hover:bg-[#F0F5FA]"
            onClick={(e) => {
              e.stopPropagation()
              toggleNodeExpanded(node.id)
            }}
          >
            {expanded ? '−' : '+'}
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-3 pb-2 pt-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
          <span className="text-[10px] text-[#3D5168]">{status.label}</span>
          <span className="ml-auto truncate text-[10px] text-[#6B82A0]">{node.lane}</span>
        </div>

        {expanded && (
          <div className="flex-1 overflow-y-auto border-t border-[#E8EFF6] px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-[#94A3B8]">
              Software & systems ({node.software.length})
            </p>
            <ul className="mt-1.5 space-y-1">
              {node.software.map((s) => {
                const missing = isPlaceholder(s.packageName)
                return (
                  <li key={s.category} className="flex items-center justify-between gap-2 text-[10.5px]">
                    <span className="truncate text-[#3D5168]">{s.category}</span>
                    <Badge
                      variant="outline"
                      className={`shrink-0 rounded px-1.5 py-0 text-[9px] font-medium ${
                        missing ? 'border-[#D0DCE8] text-[#94A3B8]' : 'border-[#B8CCE0] text-[#0B1523]'
                      }`}
                    >
                      {missing ? 'Not yet identified' : s.packageName}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
