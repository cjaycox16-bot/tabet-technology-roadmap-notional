import type { RoadmapData } from './types'
import { isPlaceholder } from './lookup'

/**
 * Condenses the roadmap into plain text for the AI assistant's system
 * prompt — every stage, its documented software, and the system-to-system
 * connections, with placeholders called out explicitly so the model doesn't
 * mistake "PLACEHOLDER - TBD" for a real answer. Small enough (18 stages,
 * ~44 connections) to just send in full rather than retrieving per-question.
 */
export function summarizeRoadmapForAi(data: RoadmapData): string {
  const lines: string[] = []

  lines.push(`Tabet Manufacturing technology roadmap — ${data.nodes.length} stages, ${data.systemConnections.length} system connections.`)
  lines.push('')
  lines.push('STAGES:')
  for (const node of data.nodes) {
    const software = node.software.map((s) => {
      const missing = isPlaceholder(s.packageName)
      return `${s.category}: ${missing ? 'not yet identified' : s.packageName}`
    })
    lines.push(
      `- [${node.key}] ${node.label} (lane: ${node.lane}, role: ${node.role}, status: ${node.status})` +
        (software.length ? ` — software: ${software.join('; ')}` : ' — no software documented'),
    )
    if (!isPlaceholder(node.process.painPoints)) lines.push(`  pain points: ${node.process.painPoints}`)
    if (!isPlaceholder(node.process.opportunity)) lines.push(`  noted opportunity: ${node.process.opportunity}`)
  }

  lines.push('')
  lines.push('PROCESS HANDOFFS (edges):')
  for (const edge of data.edges) {
    lines.push(`- ${edge.source} -> ${edge.target} (${edge.handoffType}${edge.label ? `: ${edge.label}` : ''})`)
  }

  lines.push('')
  lines.push('SYSTEM CONNECTIONS (software/data overlay):')
  for (const conn of data.systemConnections) {
    lines.push(
      `- ${conn.source} -> ${conn.target}: ${conn.systemName} (${conn.systemCategory}, ${conn.connectionType}, automation role: ${conn.automationRole || 'unspecified'})`,
    )
  }

  return lines.join('\n')
}
