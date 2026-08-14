import type { RoadmapData } from '../data/types'
import { findNode, isPlaceholder } from '../data/lookup'
import { useRoadmap } from '../context/RoadmapContext'
import { ROLE_STYLE, STATUS_STYLE } from './nodes/roleStyles'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { Badge } from './ui/badge'

export function DetailDrawer({ data }: { data: RoadmapData }) {
  const { selectedNodeId, selectNode } = useRoadmap()
  const isOpen = selectedNodeId !== null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && selectNode(null)}>
      <SheetContent className="w-[400px] sm:max-w-[400px] max-w-[85vw]">
        {selectedNodeId && <DrawerContent data={data} id={selectedNodeId} />}
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  const missing = isPlaceholder(value)
  return (
    <div className="mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</h3>
      <p className={`mt-0.5 text-sm ${missing ? 'italic text-[#94A3B8]' : 'text-[#3D5168]'}`}>
        {missing ? 'Not yet documented' : value}
      </p>
    </div>
  )
}

function DrawerContent({ data, id }: { data: RoadmapData; id: string }) {
  const node = findNode(data, id)
  if (!node) return null
  const role = ROLE_STYLE[node.role]
  const status = STATUS_STYLE[node.status]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SheetHeader className="pb-0">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
          {node.key} · {node.lane}
        </p>
        <SheetTitle className="mt-0.5 text-lg text-[#0B1523]">{node.detailTitle || node.label}</SheetTitle>
      </SheetHeader>

      <div className="mt-4 px-4 pb-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className="gap-1.5 rounded-full px-2.5 py-1"
            style={{ borderColor: role.accent, color: role.accent }}
          >
            {role.label}
          </Badge>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-2.5 py-1 text-[#3D5168]">
            <span className="h-2 w-2 rounded-full" style={{ background: status.dot }} />
            {status.label}
          </Badge>
        </div>

        <Field label="Owner" value={node.process.owner} />
        <Field label="Inputs" value={node.process.inputs || node.inputsSummary} />
        <Field label="Major activities" value={node.process.majorActivities} />
        <Field label="Outputs" value={node.process.outputs || node.outputsSummary} />
        <Field label="Quality checkpoints" value={node.process.qualityCheckpoints} />
        <Field label="Pain points" value={node.process.painPoints} />
        <Field label="Time savings estimate" value={node.process.timeSavings} />

        {!isPlaceholder(node.process.opportunity) && (
          <p className="mt-3 rounded-md bg-[#FBF1E0] px-3 py-2 text-xs text-[#7A5205]">
            <span className="font-semibold">Opportunity: </span>
            {node.process.opportunity}
          </p>
        )}

        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            Software & systems ({node.software.length})
          </h3>
          <ul className="mt-2 space-y-2">
            {node.software.map((s) => {
              const missing = isPlaceholder(s.packageName)
              return (
                <li key={s.category} className="rounded-md border border-[#E8EFF6] px-2.5 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[#0B1523]">{s.category}</span>
                    <Badge variant="secondary" className="rounded px-1.5 py-0 text-[9px] text-[#3D5168]">
                      {s.currentOrFuture}
                    </Badge>
                  </div>
                  <p className={`mt-0.5 text-xs ${missing ? 'italic text-[#94A3B8]' : 'text-[#3D5168]'}`}>
                    {missing ? 'Not yet identified' : s.packageName}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
