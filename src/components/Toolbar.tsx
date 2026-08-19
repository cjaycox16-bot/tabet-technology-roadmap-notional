import { useRoadmap } from '../context/RoadmapContext'
import { STATUS_STYLE } from './nodes/roleStyles'
import { hasActiveFilters } from '../layout/filters'
import { buildSystemCategoryStyles } from '../layout/systemStyle'
import type { RoadmapData } from '../data/types'

function Chip({
  active,
  onClick,
  children,
  dotColor,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  dotColor?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
        active
          ? 'border-[#09295F] bg-[#09295F] text-white'
          : 'border-[#D0DCE8] bg-white text-[#3D5168] hover:border-[#B8CCE0] hover:bg-[#F0F5FA]'
      }`}
    >
      {dotColor && <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#fff' : dotColor }} />}
      {children}
    </button>
  )
}

export function Toolbar({ data }: { data: RoadmapData }) {
  const {
    filters,
    toggleLane,
    toggleStatus,
    toggleSystemCategory,
    setSearch,
    clearFilters,
    expandAll,
    collapseAll,
    expandedNodeIds,
    showSystemsOverlay,
    toggleSystemsOverlay,
  } = useRoadmap()
  const statuses = Array.from(new Set(data.nodes.map((n) => n.status)))
  const systemCategoryStyles = buildSystemCategoryStyles(data.systemConnections)
  const allExpanded = expandedNodeIds.size === data.nodes.length

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#D0DCE8] bg-[#F8FAFC] px-5 py-2">
      <input
        type="text"
        value={filters.search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search stages, software, systems..."
        className="w-52 rounded-full border border-[#D0DCE8] bg-white px-3 py-1 text-[12px] text-[#0B1523] placeholder:text-[#94A3B8] focus:border-[#17499F] focus:outline-none"
      />

      <div className="mx-1 h-4 w-px bg-[#D0DCE8]" />

      <div className="flex flex-wrap items-center gap-1.5">
        {data.lanes.map((lane) => (
          <Chip key={lane} active={filters.lanes.has(lane)} onClick={() => toggleLane(lane)}>
            {lane}
          </Chip>
        ))}
      </div>

      <div className="mx-1 h-4 w-px bg-[#D0DCE8]" />

      <div className="flex flex-wrap items-center gap-1.5">
        {statuses.map((status) => (
          <Chip
            key={status}
            active={filters.statuses.has(status)}
            onClick={() => toggleStatus(status)}
            dotColor={STATUS_STYLE[status]?.dot}
          >
            {STATUS_STYLE[status]?.label ?? status}
          </Chip>
        ))}
      </div>

      <div className="mx-1 h-4 w-px bg-[#D0DCE8]" />

      <button
        type="button"
        onClick={toggleSystemsOverlay}
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
          showSystemsOverlay
            ? 'border-[#047857] bg-[#047857] text-white'
            : 'border-[#D0DCE8] bg-white text-[#3D5168] hover:border-[#B8CCE0] hover:bg-[#F0F5FA]'
        }`}
        title="Toggle the software/data connector overlay"
      >
        Systems &amp; data flow
      </button>

      {showSystemsOverlay && (
        <div className="flex flex-wrap items-center gap-1.5">
          {systemCategoryStyles.map(({ category, stroke }) => (
            <Chip
              key={category}
              active={filters.systemCategories.has(category)}
              onClick={() => toggleSystemCategory(category)}
              dotColor={stroke}
            >
              {category}
            </Chip>
          ))}
        </div>
      )}

      {hasActiveFilters(filters) && (
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full px-2.5 py-1 text-[11px] font-medium text-[#C8890A] hover:underline"
        >
          Clear filters
        </button>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => (allExpanded ? collapseAll() : expandAll(data.nodes.map((n) => n.id)))}
          className="rounded-full border border-[#D0DCE8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#3D5168] hover:bg-[#F0F5FA]"
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
    </div>
  )
}
