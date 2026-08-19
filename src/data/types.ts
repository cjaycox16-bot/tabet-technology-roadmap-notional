/** A stage's place in the shop flow, per the Flowchart Nodes sheet's node_role column. */
export type NodeRole =
  | 'Input'
  | 'Process'
  | 'Control'
  | 'Work Center'
  | 'Convergence'
  | 'Quality Gate'
  | 'Output'

/** Current-state review status, per the Lists sheet's controlled "statuses" list. */
export type NodeStatus =
  | 'Current State'
  | 'In Review'
  | 'Active Project'
  | 'Future Opportunity'
  | 'Not Started'

/** Per the Flowchart Edges sheet's handoff_type column — what actually crosses the connector. */
export type HandoffType = 'Information + status' | 'Material + status' | string

export interface SoftwareEntry {
  /** e.g. "ERP/MRP System", "AI/Automation" — per the Lists sheet's software_categories. */
  category: string
  packageName: string
  currentOrFuture: string
  owner: string
  integrationDirection: string
  keyDataObjects: string
}

export interface ProcessDetail {
  owner: string
  inputs: string
  majorActivities: string
  outputs: string
  qualityCheckpoints: string
  painPoints: string
  opportunity: string
  timeSavings: string
  notes: string
}

export interface RoadmapNode {
  /** Original Mermaid flowchart key, A-R. */
  key: string
  id: string
  label: string
  lane: string
  flowStage: number
  role: NodeRole
  status: NodeStatus
  parentGroup: string
  detailTitle: string
  inputsSummary: string
  outputsSummary: string
  process: ProcessDetail
  software: SoftwareEntry[]
}

export interface RoadmapEdge {
  id: string
  source: string
  target: string
  label?: string
  animated: boolean
  handoffType: HandoffType
  dataMaterialHandoff: string
  notes?: string
}

/** Per the System Connections / Shared Systems sheets' system_category column. */
export type SystemCategory =
  | 'ERP/MRP System'
  | 'Department Software'
  | 'Spreadsheet/Tracker'
  | 'QMS / Compliance'
  | 'AI/Automation'
  | string

/**
 * One software/data connection between two process nodes — an overlay on top
 * of the basic shop-flow edges, per the System Connections sheet. Unlike
 * RoadmapEdge (process handoff), these can jump between non-adjacent nodes
 * and different lanes to show real cross-branch system integration.
 */
export interface SystemConnection {
  id: string
  source: string
  target: string
  systemName: string
  systemCategory: SystemCategory
  connectionType: string
  dataTransmitted: string
  triggerEvent: string
  automationRole: string
  lifecycleStatus: string
  owner: string
  frequency: string
  lineColor: string
  lineStyle: string
  lineWidth: number
  animated: boolean
  notes?: string
}

/** A reusable system, per the Shared Systems sheet — used as the overlay legend. */
export interface SharedSystem {
  systemName: string
  systemCategory: SystemCategory
  lifecycleStatus: string
  systemOwner: string
  lineColor: string
  lineStyle: string
  dataScope: string
  connectedFlowchartKeys: string
  connectionCount: number
  notes?: string
}

export interface RoadmapData {
  nodes: RoadmapNode[]
  edges: RoadmapEdge[]
  /** Lane display order, e.g. for filter chips. */
  lanes: string[]
  /** Software/data overlay connections, per the System Connections sheet. */
  systemConnections: SystemConnection[]
  /** Reusable system legend, per the Shared Systems sheet. */
  systemLegend: SharedSystem[]
}
