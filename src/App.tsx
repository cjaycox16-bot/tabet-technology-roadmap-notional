import { useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { RoadmapProvider, useRoadmap } from './context/RoadmapContext'
import { FlowCanvas, type FlowCanvasHandle } from './components/FlowCanvas'
import { DetailDrawer } from './components/DetailDrawer'
import { Legend } from './components/Legend'
import { Toolbar } from './components/Toolbar'
import { ValidationDashboard } from './components/ValidationDashboard'
import { AiAssistant } from './components/AiAssistant'
import { roadmapData } from './data/roadmapData'

function AppShell() {
  const flowCanvasRef = useRef<FlowCanvasHandle>(null)
  const { connectMode, toggleConnectMode, annotations } = useRoadmap()
  const validatedCount = roadmapData.nodes.filter((n) => annotations.nodes[n.id]?.validated).length

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
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-[#C8890A]">
            {roadmapData.nodes.length} stages · {roadmapData.systemConnections.length} system connections ·{' '}
            {validatedCount}/{roadmapData.nodes.length} validated
          </span>

          <ValidationDashboard data={roadmapData} />

          <div className="flex items-center rounded-full border border-white/25 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => connectMode && toggleConnectMode()}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                connectMode ? 'text-white/70 hover:bg-white/10' : 'bg-white text-[#09295F]'
              }`}
              title="Drag a stage anywhere on its card to reposition it"
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

          <button
            type="button"
            onClick={() => flowCanvasRef.current?.resetLayout()}
            className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-medium text-white/80 hover:bg-white/10"
            title="Discard any boxes you've dragged or connectors you've drawn, and restore the default layout"
          >
            Reset layout
          </button>
        </div>
      </header>
      <Toolbar data={roadmapData} />
      <div className="relative flex-1">
        <ReactFlowProvider>
          <FlowCanvas data={roadmapData} handleRef={flowCanvasRef} />
        </ReactFlowProvider>
        <Legend data={roadmapData} />
        <DetailDrawer data={roadmapData} />
      </div>
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
