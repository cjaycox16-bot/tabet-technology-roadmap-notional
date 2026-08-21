import { useMemo, useRef, useState } from 'react'
import { LayoutDashboardIcon } from 'lucide-react'
import { ReactFlowProvider } from '@xyflow/react'
import { RoadmapProvider, useRoadmap } from './context/RoadmapContext'
import { FlowCanvas, type FlowCanvasHandle } from './components/FlowCanvas'
import { DetailDrawer } from './components/DetailDrawer'
import { Legend } from './components/Legend'
import { Toolbar } from './components/Toolbar'
import { DashboardPage } from './components/DashboardPage'
import { AiAssistant } from './components/AiAssistant'
import { roadmapData } from './data/roadmapData'
import { buildSystemCategoryStyles } from './layout/systemStyle'

/** Header abbreviations for the connector-category picker — full names (systemStyle.ts) don't fit the chip row. */
const CATEGORY_ABBREVIATION: Record<string, string> = {
  'ERP/MRP System': 'ERP/MRP',
  'Department Software': 'Dept. SW',
  'Spreadsheet/Tracker': 'Spreadsheet',
  'QMS / Compliance': 'QMS',
  'AI/Automation': 'AI/Auto',
}

type View = 'flow' | 'dashboard'

function AppShell() {
  const flowCanvasRef = useRef<FlowCanvasHandle>(null)
  const { connectMode, toggleConnectMode, connectorCategory, setConnectorCategory, annotations } = useRoadmap()
  const [view, setView] = useState<View>('flow')
  const validatedCount = roadmapData.nodes.filter((n) => annotations.nodes[n.id]?.validated).length
  const categoryStyles = useMemo(() => buildSystemCategoryStyles(roadmapData.systemConnections), [])

  return (
    <div className="flex h-screen w-screen flex-col bg-[#F0F5FA]">
      <header className="flex items-center justify-between bg-[#09295F] px-5 py-3">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}tabet-logo-white.svg`} alt="Tabet" className="h-6 w-auto" />
          <div className="h-5 w-px bg-white/20" />
          <h1
            className="text-base font-semibold uppercase tracking-wide text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Technology Roadmap
          </h1>

          <button
            type="button"
            onClick={() => setView(view === 'dashboard' ? 'flow' : 'dashboard')}
            className={`ml-2 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm transition-colors ${
              view === 'dashboard'
                ? 'bg-white text-[#09295F] hover:bg-white/90'
                : 'bg-[#C8890A] text-white hover:bg-[#E8A424]'
            }`}
            title="Every stage as a card, grouped by process, with validation status and key metrics"
          >
            <LayoutDashboardIcon className="size-3.5" />
            {view === 'dashboard' ? 'Back to flow' : 'Dashboard'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-[#C8890A]">
            {roadmapData.nodes.length} stages · {roadmapData.systemConnections.length} system connections ·{' '}
            {validatedCount}/{roadmapData.nodes.length} validated
          </span>

          {view === 'flow' && (
            <>
              <div className="flex items-center rounded-full border border-white/25 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => connectMode && toggleConnectMode()}
                  className={`rounded-full px-2.5 py-1 transition-colors ${
                    connectMode ? 'text-white/70 hover:bg-white/10' : 'bg-white text-[#09295F]'
                  }`}
                  title="Drag a stage anywhere on its card to reposition it, or drag a system/data-flow line to nudge its lane"
                >
                  Move stages
                </button>
                <button
                  type="button"
                  onClick={() => !connectMode && toggleConnectMode()}
                  className={`rounded-full px-2.5 py-1 transition-colors ${
                    connectMode ? 'bg-white text-[#09295F]' : 'text-white/70 hover:bg-white/10'
                  }`}
                  title="Reveals a drag point on every side and corner of each stage — drag between two to draw a connector"
                >
                  Draw connectors
                </button>
              </div>

              {connectMode && (
                <div className="flex items-center gap-1 rounded-full border border-white/25 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setConnectorCategory(null)}
                    className={`rounded-full px-2 py-1 transition-colors ${
                      connectorCategory === null ? 'bg-white text-[#09295F]' : 'text-white/70 hover:bg-white/10'
                    }`}
                    title="Draw the next connector with the generic manual (teal dashed) style"
                  >
                    Manual
                  </button>
                  {categoryStyles.map((style) => (
                    <button
                      key={style.category}
                      type="button"
                      onClick={() => setConnectorCategory(style.category)}
                      className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
                        connectorCategory === style.category
                          ? 'bg-white text-[#09295F]'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                      title={`Draw the next connector styled as ${style.category}`}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: style.stroke }} />
                      {CATEGORY_ABBREVIATION[style.category] ?? style.category}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => flowCanvasRef.current?.resetLayout()}
                className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-white/10"
                title="Discard any boxes you've dragged, lanes you've nudged, or connectors you've drawn, and restore the default layout"
              >
                Reset layout
              </button>
            </>
          )}
        </div>
      </header>

      {view === 'dashboard' ? (
        <DashboardPage data={roadmapData} />
      ) : (
        <>
          <Toolbar data={roadmapData} />
          <div className="relative flex-1">
            <ReactFlowProvider>
              <FlowCanvas data={roadmapData} handleRef={flowCanvasRef} />
            </ReactFlowProvider>
            <Legend data={roadmapData} />
            <DetailDrawer data={roadmapData} />
          </div>
        </>
      )}

      <AiAssistant data={roadmapData} />
    </div>
  )
}

function App() {
  return (
    <RoadmapProvider>
      <AppShell />
    </RoadmapProvider>
  )
}

export default App
