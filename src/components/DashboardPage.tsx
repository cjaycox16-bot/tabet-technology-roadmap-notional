import { useMemo, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import type { RoadmapData, RoadmapNode } from '../data/types'
import { isPlaceholder } from '../data/lookup'
import { applyEdits } from '../data/annotate'
import { useRoadmap } from '../context/RoadmapContext'
import { ROLE_STYLE } from './nodes/roleStyles'
import { NodeDetailPanel } from './NodeDetailPanel'

type StatusFilter = 'all' | 'pending' | 'validated'

const MONO = "ui-monospace, 'SFMono-Regular', 'Cascadia Code', Consolas, monospace"
const PANEL = '#111E33'
const PANEL_BORDER = '#233A57'
const TEXT_BRIGHT = '#EAF1F9'
const TEXT_MUTED = '#7E93B3'
const TEXT_FAINT = '#5C7395'
const TEAL = '#0AACE0'
const GREEN = '#22C55E'
const GOLD = '#E8A424'

/** A compact instrument readout: thin colored accent bar, a small caps label, a monospace value. */
function StatTile({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-md" style={{ background: PANEL, border: `1px solid ${PANEL_BORDER}` }}>
      <div className="w-1 shrink-0" style={{ background: accent }} />
      <div className="px-3.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: TEXT_MUTED }}>
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold" style={{ color: TEXT_BRIGHT, fontFamily: MONO }}>
          {value}
        </p>
      </div>
    </div>
  )
}

/**
 * The full-page counterpart to the old modal dashboard: same validate/edit/
 * notes machinery (NodeDetailPanel, unchanged), styled as a shop-floor
 * command center — dark instrument panels and a validation-progress meter up
 * top, cards grouped into lane "panels" below. The one deliberately loud
 * move is the expanded card: it lights up as a bright active readout against
 * the dark shell, like switching on a console screen, rather than blending
 * into the same dark surface as everything ambient around it.
 */
export function DashboardPage({ data }: { data: RoadmapData }) {
  const { annotations } = useRoadmap()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const validatedCount = data.nodes.filter((n) => annotations.nodes[n.id]?.validated).length
  const validatedPct = Math.round((validatedCount / data.nodes.length) * 100)
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
    <div
      className="flex-1 overflow-y-auto px-6 py-5"
      style={{
        background: '#0A1628',
        backgroundImage:
          'linear-gradient(rgba(234,241,249,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(234,241,249,0.035) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Hero: validation progress is the one number this page leads with. */}
        <div className="rounded-lg px-5 py-4" style={{ background: PANEL, border: `1px solid ${PANEL_BORDER}` }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: TEAL }}>
            Validation progress
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-5xl font-semibold" style={{ color: TEXT_BRIGHT, fontFamily: MONO }}>
              {validatedCount}/{data.nodes.length}
            </span>
            <span className="text-lg" style={{ color: TEXT_MUTED, fontFamily: MONO }}>
              {validatedPct}% complete
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(10,172,224,0.14)' }}>
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${validatedPct}%`, background: TEAL, boxShadow: `0 0 8px ${TEAL}` }}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile label="Total stages" value={data.nodes.length} accent={TEXT_FAINT} />
          <StatTile label="System connections" value={data.systemConnections.length} accent={TEAL} />
          <StatTile label="Automation opportunities noted" value={opportunityCount} accent={GOLD} />
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          {(['all', 'pending', 'validated'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                statusFilter === f
                  ? { background: TEAL, color: '#04202E', border: `1px solid ${TEAL}` }
                  : { background: 'transparent', color: TEXT_MUTED, border: `1px solid ${PANEL_BORDER}` }
              }
            >
              {f === 'all' ? 'All stages' : f === 'pending' ? 'Pending' : 'Validated'}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-7">
          {data.lanes.map((lane) => {
            const laneNodes = (nodesByLane.get(lane) ?? []).filter((n) => matchesFilter(n.id))
            if (laneNodes.length === 0) return null
            const laneValidated = laneNodes.filter((n) => annotations.nodes[n.id]?.validated).length

            return (
              <section key={lane}>
                <div className="flex items-center gap-3">
                  <h2
                    className="shrink-0 text-xs font-bold uppercase tracking-wider"
                    style={{ color: TEXT_BRIGHT, fontFamily: 'var(--font-heading)' }}
                  >
                    {lane}
                  </h2>
                  <div className="h-px flex-1" style={{ background: PANEL_BORDER }} />
                  <span className="shrink-0 text-[11px]" style={{ color: TEXT_FAINT, fontFamily: MONO }}>
                    {laneValidated}/{laneNodes.length} validated
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {laneNodes.map((node) => {
                    const validated = Boolean(annotations.nodes[node.id]?.validated)
                    const role = ROLE_STYLE[node.role]
                    const isExpanded = expandedId === node.id
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : node.id)}
                        className="flex items-start gap-2.5 rounded-md px-3.5 py-3 text-left transition-colors"
                        style={{
                          background: PANEL,
                          border: `1px solid ${isExpanded ? TEAL : PANEL_BORDER}`,
                          boxShadow: isExpanded ? `0 0 0 1px ${TEAL}` : undefined,
                        }}
                      >
                        <span
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: role.accent, fontFamily: MONO }}
                        >
                          {node.key}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium" style={{ color: TEXT_BRIGHT }}>
                            {node.label}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide" style={{ color: TEXT_MUTED }}>
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: role.accent }} />
                            {role.label}
                          </span>
                          <span
                            className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium"
                            style={{ color: validated ? GREEN : TEXT_MUTED }}
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                background: validated ? GREEN : 'transparent',
                                border: validated ? 'none' : `1.5px solid ${GOLD}`,
                                boxShadow: validated ? `0 0 6px ${GREEN}` : undefined,
                              }}
                            />
                            {validated ? 'Validated' : 'Pending'}
                          </span>
                        </span>
                        <ChevronDownIcon
                          className="mt-1 size-4 shrink-0 transition-transform"
                          style={{ color: TEXT_FAINT, transform: isExpanded ? 'rotate(180deg)' : undefined }}
                        />
                      </button>
                    )
                  })}
                </div>

                {laneNodes.some((n) => n.id === expandedId) && (
                  <div
                    className="mt-3 rounded-lg bg-white px-5 py-4"
                    style={{ boxShadow: `0 0 0 2px ${TEAL}, 0 0 32px rgba(10,172,224,0.35)` }}
                  >
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
