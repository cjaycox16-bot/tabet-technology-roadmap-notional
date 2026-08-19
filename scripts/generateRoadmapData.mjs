// Reads Tabet_Flowchart_Interconnected_Systems_Framework.xlsx and writes
// src/data/roadmapData.ts. Rerun this after the workbook changes instead of
// hand-editing the generated file.
import XLSX from 'xlsx'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const workbookPath = path.join(root, 'Tabet_Flowchart_Interconnected_Systems_Framework.xlsx')
const outPath = path.join(root, 'src/data/roadmapData.ts')

const wb = XLSX.readFile(workbookPath)
const sheet = (name) => XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' })

const flowchartNodes = sheet('Flowchart Nodes')
const flowchartEdges = sheet('Flowchart Edges')
const processRegister = sheet('Process Register')
const processSoftware = sheet('Process Software')
const systemConnectionsSheet = sheet('System Connections')
const sharedSystemsSheet = sheet('Shared Systems')
const listsSheet = sheet('Lists')

const registerByNodeId = new Map(processRegister.map((r) => [r.node_id, r]))
const softwareByNodeId = new Map()
for (const row of processSoftware) {
  const list = softwareByNodeId.get(row.node_id) ?? []
  list.push(row)
  softwareByNodeId.set(row.node_id, list)
}

const nodes = flowchartNodes.map((n) => {
  const reg = registerByNodeId.get(n.node_id) ?? {}
  const software = (softwareByNodeId.get(n.node_id) ?? []).map((s) => ({
    category: s.software_category,
    packageName: s.package_name_notional,
    currentOrFuture: s.lifecycle_status,
    owner: s.system_owner,
    integrationDirection: s.integration_direction,
    keyDataObjects: s.key_data_objects,
  }))

  return {
    key: n.flowchart_key,
    id: n.node_id,
    label: n.label,
    lane: n.lane,
    flowStage: n.flow_stage,
    role: n.node_role,
    status: n.status,
    parentGroup: n.parent_group,
    detailTitle: n.detail_panel_title,
    inputsSummary: n.inputs_summary,
    outputsSummary: n.outputs_summary,
    process: {
      owner: reg.process_owner ?? '',
      inputs: reg.inputs ?? n.inputs_summary,
      majorActivities: reg.major_activities ?? '',
      outputs: reg.outputs ?? n.outputs_summary,
      qualityCheckpoints: reg.quality_checkpoints ?? '',
      painPoints: reg.pain_points_notional ?? '',
      opportunity: reg.opportunity_notional ?? '',
      timeSavings: reg.time_savings_notional ?? '',
      notes: reg.notes ?? '',
    },
    software,
  }
})

const edges = flowchartEdges.map((e) => ({
  id: e.edge_id,
  source: e.source_node_id,
  target: e.target_node_id,
  label: e.label || undefined,
  animated: Boolean(e.animated),
  handoffType: e.handoff_type,
  dataMaterialHandoff: e.data_material_handoff,
  notes: e.notes || undefined,
}))

const systemConnections = systemConnectionsSheet.map((c) => ({
  id: c.connection_id,
  source: c.source_node_id,
  target: c.target_node_id,
  systemName: c.system_name,
  systemCategory: c.system_category,
  connectionType: c.connection_type,
  dataTransmitted: c.data_transmitted,
  triggerEvent: c.trigger_event,
  automationRole: c.automation_role,
  lifecycleStatus: c.lifecycle_status,
  owner: c.owner,
  frequency: c.frequency,
  lineColor: c.line_color,
  lineStyle: c.line_style,
  lineWidth: c.line_width,
  animated: Boolean(c.animated),
  notes: c.notes || undefined,
}))

const systemLegend = sharedSystemsSheet.map((s) => ({
  systemName: s.system_name,
  systemCategory: s.system_category,
  lifecycleStatus: s.lifecycle_status,
  systemOwner: s.system_owner,
  lineColor: s.line_color,
  lineStyle: s.line_style,
  dataScope: s.data_scope,
  connectedFlowchartKeys: s.connected_flowchart_keys,
  connectionCount: s.connection_count,
  notes: s.notes || undefined,
}))

const lanes = listsSheet.map((r) => r.lanes).filter((l) => l && String(l).trim().length > 0)

const roadmapData = { nodes, edges, lanes, systemConnections, systemLegend }

const banner = `// GENERATED from Tabet_Flowchart_Interconnected_Systems_Framework.xlsx — do not hand-edit, rerun \`node scripts/generateRoadmapData.mjs\` instead.\nimport type { RoadmapData } from './types'\n\nexport const roadmapData: RoadmapData = `

writeFileSync(outPath, `${banner}${JSON.stringify(roadmapData, null, 2)}\n`)

console.log(`Wrote ${nodes.length} nodes, ${edges.length} edges, ${systemConnections.length} system connections, ${systemLegend.length} shared systems, ${lanes.length} lanes to ${path.relative(root, outPath)}`)
