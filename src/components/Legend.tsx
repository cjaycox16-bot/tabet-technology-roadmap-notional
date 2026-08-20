import { HANDOFF_STYLE, ROLE_STYLE } from './nodes/roleStyles'
import { buildSystemCategoryStyles } from '../layout/systemStyle'
import { useRoadmap } from '../context/RoadmapContext'
import type { NodeRole, RoadmapData } from '../data/types'

const ROLE_ORDER: NodeRole[] = ['Input', 'Process', 'Control', 'Work Center', 'Convergence', 'Quality Gate', 'Output']

function LegendLine({ stroke, dasharray, animated }: { stroke: string; dasharray?: string; animated?: boolean }) {
  return (
    <svg width="24" height="8" className="shrink-0">
      <line x1="0" y1="4" x2="24" y2="4" stroke={stroke} strokeWidth="2" strokeDasharray={dasharray}>
        {animated && (
          <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
        )}
      </line>
    </svg>
  )
}

export function Legend({ data }: { data: RoadmapData }) {
  const { showSystemsOverlay } = useRoadmap()
  const systemCategoryStyles = buildSystemCategoryStyles(data.systemConnections)

  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex max-w-[420px] flex-wrap items-start gap-3">
      <div className="w-[210px] rounded-md border border-[#D0DCE8] bg-white/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur">
        <p className="mb-1.5 font-semibold text-[#3D5168]">Stage role</p>
        {ROLE_ORDER.map((role) => (
          <div key={role} className="mt-1 flex items-center gap-2 first:mt-0">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ROLE_STYLE[role].accent }} />
            <span className="text-[#3D5168]">{ROLE_STYLE[role].label}</span>
          </div>
        ))}

        <p className="mb-1.5 mt-2.5 border-t border-[#E8EFF6] pt-2 font-semibold text-[#3D5168]">Process handoff</p>
        {Object.entries(HANDOFF_STYLE).map(([type, style]) => (
          <div key={type} className="mt-1 flex items-center gap-2 first:mt-0">
            <LegendLine stroke={style.stroke} dasharray={style.dashed ? '4 3' : undefined} />
            <span className="text-[#3D5168]">{style.label}</span>
          </div>
        ))}

        <div className="mt-2 flex items-center gap-2 border-t border-[#E8EFF6] pt-2">
          <LegendLine stroke="#0AACE0" dasharray="1 4" />
          <span className="text-[#3D5168]">Your connector</span>
        </div>
        <p className="mt-1.5 text-[10px] leading-snug text-[#94A3B8]">
          Drag from the small cyan dot at the top or bottom of a stage to the dot on another stage — saved to this browser only.
        </p>
      </div>

      {showSystemsOverlay && (
        <div className="w-[190px] rounded-md border border-[#D0DCE8] bg-white/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur">
          <p className="mb-1.5 font-semibold text-[#3D5168]">Systems &amp; data flow</p>
          {systemCategoryStyles.map((style) => (
            <div key={style.category} className="mt-1 flex items-center gap-2 first:mt-0">
              <LegendLine stroke={style.stroke} dasharray={style.dasharray} animated={style.animated} />
              <span className="text-[#3D5168]">{style.category}</span>
            </div>
          ))}
          <p className="mt-1.5 border-t border-[#E8EFF6] pt-1.5 text-[10px] leading-snug text-[#94A3B8]">
            Hover or click a stage to see which systems connect to it.
          </p>
        </div>
      )}
    </div>
  )
}
