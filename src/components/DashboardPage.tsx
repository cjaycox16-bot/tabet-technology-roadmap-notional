import { useMemo, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import type { RoadmapData, RoadmapNode } from '../data/types'
import { isPlaceholder } from '../data/lookup'
import { applyEdits } from '../data/annotate'
import { useRoadmap } from '../context/RoadmapContext'
import { ROLE_STYLE } from './nodes/roleStyles'
import { NodeDetailPanel } from './NodeDetailPanel'

type StatusFilter = 'all' | 'pending' | 'validated'

function StatTile({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-[#D0DCE8] bg-white px-4 py-3">
      <p className="text-xs font-medium text-[#6B82A0]">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: accent ?? '#0B1523' }}>
        {value}
      </p>
    </div>
  )
}

/**
 * The full-page counterpart to the old modal dashboard: same validate/edit/
 * notes machinery (NodeDetailPanel, unchanged), but laid out with room to
 * breathe — a metrics strip, then every stage as a card grouped by lane
 * (the shop-flow's natural process grouping) instead of one long list.
 */
export function DashboardPage({ data }: { data: RoadmapData }) {
  const { annotations } = useRoadmap()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const validatedCount = data.nodes.filter((n) => annotations.nodes[n.id]?.validated).length
  const opportunityCount = useMemo(
    () =>
      data.nodes.filter((n) => {
        const effective = applyEdits(n, annotations.nodes[n.id]?.edits)
        return !isPlaceholder(effective.process.opportunity)
      }).length,
    [data.nodes, annotations],
  )

  const nodesByLane = useMemo(() => {
    const groups = new Map<string, RoadmapNode[]>()
    for (const lane of data.lanes) groups.set(lane, [])
    for (const node of data.nodes) {
      if (!groups.has(node.lane)) groups.set(node.lane, [])
      groups.get(node.lane)!.push(node)
    }
    return groups
  }, [data.nodes, data.lanes])

  const matchesFilter = (nodeId: string) => {
    const validated = Boolean(annotations.nodes[nodeId]?.validated)
    if (statusFilter === 'pending') return !validated
    if (statusFilter === 'validated') return validated
    return true
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F5FA] px-6 py-5">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="Total stages" value={data.nodes.length} />
          <StatTile label="Validated" value={`${validatedCount} (${Math.round((validatedCount / data.nodes.length) * 100)}%)`} accent="#047857" />
          <StatTile label="Pending validation" value={data.nodes.length - validatedCount} accent="#C8890A" />
          <StatTile label="System connections" value={data.systemConnections.length} />
          <StatTile label="Automation opportunities noted" value={opportunityCount} accent="#17499F" />
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          {(['all', 'pending', 'validated'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f
                  ? 'border-[#09295F] bg-[#09295F] text-white'
                  : 'border-[#D0DCE8] bg-white text-[#3D5168] hover:bg-[#F0F5FA]'
              }`}
            >
              {f === 'all' ? 'All stages' : f === 'pending' ? 'Pending' : 'Validated'}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-8">
          {data.lanes.map((lane) => {
            const laneNodes = (nodesByLane.get(lane) ?? []).filter((n) => matchesFilter(n.id))
            if (laneNodes.length === 0) return null
            const laneValidated = laneNodes.filter((n) => annotations.nodes[n.id]?.validated).length

            return (
              <section key={lane}>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3D5168]">{lane}</h2>
                  <span className="text-xs text-[#94A3B8]">
                    {laneValidated} of {laneNodes.length} validated
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {laneNodes.map((node) => {
                    const validated = Boolean(annotations.nodes[node.id]?.validated)
                    const role = ROLE_STYLE[node.role]
                    const isExpanded = expandedId === node.id
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : node.id)}
                        className={`flex items-start gap-2.5 rounded-lg border bg-white px-3.5 py-3 text-left transition-shadow hover:shadow-md ${
                          isExpanded ? 'border-[#17499F] shadow-md' : 'border-[#D0DCE8]'
                        }`}
                      >
                        <span
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white"
                          style={{ background: role.accent }}
                        >
                          {node.key}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-[#0B1523]">{node.label}</span>
                          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide" style={{ color: role.accent }}>
                            {role.label}
                          </span>
                          <span
                            className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              validated ? 'bg-[#047857] text-white' : 'bg-[#FBF1E0] text-[#7A5205]'
                            }`}
                          >
                            {validated ? '✓ Validated' : 'Pending'}
                          </span>
                        </span>
                        <ChevronDownIcon
                          className={`mt-1 size-4 shrink-0 text-[#94A3B8] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )
                  })}
                </div>

                {laneNodes.some((n) => n.id === expandedId) && (
                  <div className="mt-3 rounded-lg border border-[#D0DCE8] bg-white px-5 py-4">
                    <NodeDetailPanel data={data} id={expandedId as string} />
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
