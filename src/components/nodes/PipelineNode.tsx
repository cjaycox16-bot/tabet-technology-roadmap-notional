import { Fragment } from 'react'
import { Handle, Position, type HandleType, type NodeProps } from '@xyflow/react'
import type { FlowNode } from '../../layout/buildGraph'
import { useRoadmap } from '../../context/RoadmapContext'
import { isPlaceholder } from '../../data/lookup'
import { ROLE_STYLE, STATUS_STYLE } from './roleStyles'
import { Badge } from '../ui/badge'

type PipelineNodeProps = NodeProps<Extract<FlowNode, { type: 'pipelineNode' }>>

/** How far in from each corner the diagonal connect points sit, as a % of the node's width/height. */
const CORNER_INSET = '14%'
const CORNER_FAR = `calc(100% - 14%)`

const HANDLE_TYPES: HandleType[] = ['source', 'target']

/**
 * The 8 connect points. 'top'/'bottom' stay mounted regardless of mode — the
 * vertical process-flow edges (computeBaseLayout.ts) reference them by id.
 * The other 6 only exist while connectMode is on: a <Handle> always carries
 * React Flow's "nodrag" class, so leaving them mounted in move mode would
 * turn every side/corner into a small dead spot you can't grab to drag the
 * stage — the exact problem that mode exists to avoid.
 *
 * Each point renders BOTH a source and a target handle stacked on the same
 * spot, so a drag can start or end at any of the 8 regardless of direction
 * — without that, only source-to-target drags would work reliably.
 */
const HANDLE_POINTS: { id: string; position: Position; alwaysOn?: boolean; style?: React.CSSProperties }[] = [
  { id: 'top', position: Position.Top, alwaysOn: true },
  { id: 'top-left', position: Position.Top, style: { left: CORNER_INSET } },
  { id: 'top-right', position: Position.Top, style: { left: CORNER_FAR } },
  { id: 'right', position: Position.Right },
  { id: 'bottom-right', position: Position.Bottom, style: { left: CORNER_FAR } },
  { id: 'bottom', position: Position.Bottom, alwaysOn: true },
  { id: 'bottom-left', position: Position.Bottom, style: { left: CORNER_INSET } },
  { id: 'left', position: Position.Left },
]

export function PipelineNode({ data }: PipelineNodeProps) {
  const { selectNode, toggleNodeExpanded, setHoveredNode, connectMode } = useRoadmap()
  const { node, expanded, dimmed } = data
  const role = ROLE_STYLE[node.role]
  const status = STATUS_STYLE[node.status]

  return (
    // Handles live in this unclipped wrapper rather than the rounded card
    // below — overflow-hidden on the card (needed to keep its tinted header
    // inside the rounded corners) would otherwise clip the half of each dot
    // that sits outside the border.
    <div className="relative h-full w-full">
      {HANDLE_POINTS.map(({ id, position, alwaysOn, style }) => {
        if (!alwaysOn && !connectMode) return null
        return (
          <Fragment key={id}>
            {HANDLE_TYPES.map((type) => (
              <Handle key={type} id={id} type={type} position={position} style={style} />
            ))}
          </Fragment>
        )
      })}

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
