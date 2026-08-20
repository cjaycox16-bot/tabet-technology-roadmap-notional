import { useMemo, useState } from 'react'
import { Dialog } from 'radix-ui'
import { XIcon, ChevronDownIcon } from 'lucide-react'
import type { RoadmapData } from '../data/types'
import { useRoadmap } from '../context/RoadmapContext'
import { ROLE_STYLE } from './nodes/roleStyles'
import { NodeDetailPanel } from './NodeDetailPanel'

type StatusFilter = 'all' | 'pending' | 'validated'

/**
 * A review-queue view of every stage: browse by validation status, expand
 * one in place to see/edit the full picture and mark it off, without losing
 * your spot in the list the way jumping out to the canvas + side drawer for
 * each one would. Reuses NodeDetailPanel — the same edit form and notes box
 * as the drawer — so validating from here behaves identically.
 */
export function ValidationDashboard({ data }: { data: RoadmapData }) {
  const { annotations } = useRoadmap()
  const [open, setOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const validatedCount = data.nodes.filter((n) => annotations.nodes[n.id]?.validated).length

  const visibleNodes = useMemo(() => {
    if (statusFilter === 'all') return data.nodes
    return data.nodes.filter((n) =>
      statusFilter === 'validated' ? annotations.nodes[n.id]?.validated : !annotations.nodes[n.id]?.validated,
    )
  }, [data.nodes, annotations, statusFilter])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-white/25 px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-white/10"
          title="Review every stage and mark it validated or pending"
        >
          Validation: {validatedCount}/{data.nodes.length}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex h-[85vh] w-[900px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-white shadow-xl data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between border-b border-[#E8EFF6] px-5 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-[#0B1523]">Validation dashboard</Dialog.Title>
              <Dialog.Description className="text-xs text-[#6B82A0]">
                {validatedCount} of {data.nodes.length} stages confirmed accurate — click a stage to review, edit, or
                add notes.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full p-1.5 text-[#6B82A0] hover:bg-[#F0F5FA] hover:text-[#0B1523]">
              <XIcon className="size-4" />
            </Dialog.Close>
          </div>

          <div className="flex items-center gap-1.5 border-b border-[#E8EFF6] px-5 py-2.5">
            {(['all', 'pending', 'validated'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  statusFilter === f
                    ? 'border-[#09295F] bg-[#09295F] text-white'
                    : 'border-[#D0DCE8] bg-white text-[#3D5168] hover:bg-[#F0F5FA]'
                }`}
              >
                {f === 'all' ? 'All stages' : f === 'pending' ? 'Pending' : 'Validated'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            <ul className="space-y-2">
              {visibleNodes.map((node) => {
                const validated = Boolean(annotations.nodes[node.id]?.validated)
                const isExpanded = expandedId === node.id
                const role = ROLE_STYLE[node.role]
                return (
                  <li key={node.id} className="rounded-md border border-[#E8EFF6]">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : node.id)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white"
                        style={{ background: role.accent }}
                      >
                        {node.key}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#0B1523]">{node.label}</span>
                        <span className="block truncate text-xs text-[#6B82A0]">{node.lane}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          validated ? 'bg-[#047857] text-white' : 'bg-[#FBF1E0] text-[#7A5205]'
                        }`}
                      >
                        {validated ? '✓ Validated' : 'Pending'}
                      </span>
                      <ChevronDownIcon
                        className={`size-4 shrink-0 text-[#94A3B8] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[#E8EFF6] px-3 py-3">
                        <NodeDetailPanel data={data} id={node.id} />
                      </div>
                    )}
                  </li>
                )
              })}
              {visibleNodes.length === 0 && (
                <p className="py-8 text-center text-sm text-[#94A3B8]">No stages match this filter.</p>
              )}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
