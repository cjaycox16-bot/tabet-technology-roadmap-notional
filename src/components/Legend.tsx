import { HANDOFF_STYLE, ROLE_STYLE } from './nodes/roleStyles'
import type { NodeRole } from '../data/types'

const ROLE_ORDER: NodeRole[] = ['Input', 'Process', 'Control', 'Work Center', 'Convergence', 'Quality Gate', 'Output']

export function Legend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-[230px] rounded-md border border-[#D0DCE8] bg-white/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur">
      <p className="mb-1.5 font-semibold text-[#3D5168]">Stage role</p>
      {ROLE_ORDER.map((role) => (
        <div key={role} className="mt-1 flex items-center gap-2 first:mt-0">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ROLE_STYLE[role].accent }} />
          <span className="text-[#3D5168]">{ROLE_STYLE[role].label}</span>
        </div>
      ))}

      <p className="mb-1.5 mt-2.5 border-t border-[#E8EFF6] pt-2 font-semibold text-[#3D5168]">Handoff</p>
      {Object.entries(HANDOFF_STYLE).map(([type, style]) => (
        <div key={type} className="mt-1 flex items-center gap-2 first:mt-0">
          <svg width="24" height="8" className="shrink-0">
            <line
              x1="0"
              y1="4"
              x2="24"
              y2="4"
              stroke={style.stroke}
              strokeWidth="2"
              strokeDasharray={style.dashed ? '4 3' : undefined}
            />
          </svg>
          <span className="text-[#3D5168]">{style.label}</span>
        </div>
      ))}

      <div className="mt-2 flex items-center gap-2 border-t border-[#E8EFF6] pt-2">
        <svg width="24" height="8" className="shrink-0">
          <line x1="0" y1="4" x2="24" y2="4" stroke="#0AACE0" strokeWidth="2" strokeDasharray="1 4" />
        </svg>
        <span className="text-[#3D5168]">Your connector</span>
      </div>
      <p className="mt-1.5 text-[10px] leading-snug text-[#94A3B8]">
        Drag a box, or drag between two dots to connect them — saved to this browser only.
      </p>
    </div>
  )
}
