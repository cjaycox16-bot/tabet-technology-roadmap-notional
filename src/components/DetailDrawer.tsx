import type { RoadmapData } from '../data/types'
import { findNode } from '../data/lookup'
import { useRoadmap } from '../context/RoadmapContext'
import { NodeDetailPanel } from './NodeDetailPanel'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'

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

function DrawerContent({ data, id }: { data: RoadmapData; id: string }) {
  const node = findNode(data, id)
  if (!node) return null

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SheetHeader className="pb-0">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
          {node.key} · {node.lane}
        </p>
        <SheetTitle className="mt-0.5 text-lg text-[#0B1523]">{node.detailTitle || node.label}</SheetTitle>
      </SheetHeader>

      <div className="mt-4 px-4 pb-6">
        <NodeDetailPanel data={data} id={id} />
      </div>
    </div>
  )
}
