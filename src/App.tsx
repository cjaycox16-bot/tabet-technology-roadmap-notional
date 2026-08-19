import { useRef } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { RoadmapProvider } from './context/RoadmapContext'
import { FlowCanvas, type FlowCanvasHandle } from './components/FlowCanvas'
import { DetailDrawer } from './components/DetailDrawer'
import { Legend } from './components/Legend'
import { Toolbar } from './components/Toolbar'
import { roadmapData } from './data/roadmapData'

function App() {
  const flowCanvasRef = useRef<FlowCanvasHandle>(null)

  return (
    <RoadmapProvider>
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
              {roadmapData.nodes.length} stages · {roadmapData.systemConnections.length} system connections ·
              notional data, pending validation
            </span>
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
      </div>
    </RoadmapProvider>
  )
}

export default App
