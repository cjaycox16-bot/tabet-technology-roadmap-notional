import type { NodeRole } from '../../data/types'

/**
 * Every hex here comes from the live Tabet site's Tailwind config
 * (tabet-theme brand palette: brand navy #09295F, gold #C8890A, plus the
 * teal used for its "innovation" tag chips) — kept close to that source
 * rather than the workbook's generic blue/green/purple swatches so this
 * roadmap reads as a Tabet tool, not a generic diagram.
 */
export const ROLE_STYLE: Record<NodeRole, { accent: string; tint: string; label: string }> = {
  Input: { accent: '#09295F', tint: '#EAF0FA', label: 'Input' },
  Process: { accent: '#17499F', tint: '#EDF3FC', label: 'Process' },
  Control: { accent: '#C8890A', tint: '#FBF1E0', label: 'Control point' },
  'Work Center': { accent: '#0AACE0', tint: '#E7F8FE', label: 'Work center' },
  Convergence: { accent: '#3D5168', tint: '#F0F5FA', label: 'Convergence' },
  'Quality Gate': { accent: '#E8A424', tint: '#FCF3E2', label: 'Quality gate' },
  Output: { accent: '#050F2A', tint: '#E7EAF1', label: 'Output' },
}

export const STATUS_STYLE: Record<string, { dot: string; label: string }> = {
  'Current State': { dot: '#17499F', label: 'Current state' },
  'In Review': { dot: '#C8890A', label: 'In review' },
  'Active Project': { dot: '#0AACE0', label: 'Active project' },
  'Future Opportunity': { dot: '#6D28D9', label: 'Future opportunity' },
  'Not Started': { dot: '#94A3B8', label: 'Not started' },
}

export const HANDOFF_STYLE: Record<string, { stroke: string; dashed: boolean; label: string }> = {
  'Information + status': { stroke: '#17499F', dashed: true, label: 'Information + status handoff' },
  'Material + status': { stroke: '#C8890A', dashed: false, label: 'Material + status handoff' },
}

export const DEFAULT_HANDOFF_STYLE = { stroke: '#6B82A0', dashed: false, label: 'Handoff' }
