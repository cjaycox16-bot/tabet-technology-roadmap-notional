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

export interface RoadmapData {
  nodes: RoadmapNode[]
  edges: RoadmapEdge[]
  /** Lane display order, e.g. for filter chips. */
  lanes: string[]
}
