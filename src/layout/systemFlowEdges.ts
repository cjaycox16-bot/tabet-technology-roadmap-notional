import { MarkerType, type Edge } from '@xyflow/react'
import type { RoadmapData } from '../data/types'
import { routeSystemEdges, type RoutedEdgeResult } from './routeSystemEdges'
import { nodeMatchesFilters, systemConnectionMatchesFilters, type FilterState } from './filters'
import { dasharrayForLineStyle } from './systemStyle'
import type { SystemEndpointOverrides } from '../persistence/systemEndpointStorage'

export interface NodeBox {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface BuildSystemFlowEdgesOptions {
  laneOffsets: Record<string, number>
  onNudgeLane: (laneKey: string, deltaX: number) => void
  /** Per-connection source/target corrections dragged in via RoutedEdge.tsx's endpoint handles — keyed by SystemConnection.id. */
  endpointOverrides: SystemEndpointOverrides
  onRetargetEndpoint: (connectionId: string, end: 'source' | 'target', newNodeId: string) => void
}

/**
 * Software/data overlay edges, per the System Connections sheet. Takes node
 * positions as a plain argument rather than reading them from a prior layout
 * pass — call this with the CURRENT node positions (including drag
 * overrides) so the bus routes track a dragged node instead of freezing at
 * wherever it was when the page first loaded.
 *
 * Connections between nodes that are already adjacent in the process flow
 * (i.e. the same source/target pair as an existing process-flow edge) are
 * skipped on the canvas — that handoff is already drawn as the plain
 * process arrow directly below/above, so a second colored line tracing the
 * exact same path is pure redundancy. They're still listed in full in the
 * per-node detail panel; this only trims what's drawn on the canvas. This
 * dedup check is based on each connection's ORIGINAL source/target (the
 * canonical, Excel-sourced handoff) rather than any endpoint override — a
 * diagram-only re-terminus shouldn't change whether the documented handoff
 * is considered redundant.
 */
export function buildSystemFlowEdges(
  data: RoadmapData,
  filters: FilterState,
  boxes: NodeBox[],
  options: BuildSystemFlowEdgesOptions,
): Edge[] {
  const { laneOffsets, onNudgeLane, endpointOverrides, onRetargetEndpoint } = options
  const processPairs = new Set(data.edges.map((e) => `${e.source}->${e.target}`))
  const canvasConnections = data.systemConnections.filter((sc) => !processPairs.has(`${sc.source}->${sc.target}`))

  const effectiveEndpoints = new Map(
    canvasConnections.map((sc) => {
      const override = endpointOverrides[sc.id]
      return [sc.id, { source: override?.source ?? sc.source, target: override?.target ?? sc.target }] as const
    }),
  )

  const matches = new Map(data.nodes.map((n) => [n.id, nodeMatchesFilters(n, filters)]))
  const routes = routeSystemEdges(
    boxes,
    canvasConnections.map((sc) => {
      const { source, target } = effectiveEndpoints.get(sc.id)!
      return { id: sc.id, source, target, category: sc.systemCategory }
    }),
    laneOffsets,
  )

  const { sourceOffsets, targetOffsets } = computeHandleFanOffsets(canvasConnections, effectiveEndpoints, routes)

  return canvasConnections.map((sc) => {
    const { source, target } = effectiveEndpoints.get(sc.id)!
    const filterDimmed =
      !matches.get(source) || !matches.get(target) || !systemConnectionMatchesFilters(sc, filters)
    const route = routes.get(sc.id)

    return {
      id: sc.id,
      source,
      target,
      type: 'systemRoute',
      deletable: false,
      selectable: false,
      animated: sc.animated,
      // Opacity/weight are computed live in RoutedEdge from hover/selection
      // state, not baked in here — that's what lets hovering a stage
      // highlight just its own connections without recomputing routes.
      data: {
        points: route?.points ?? [],
        laneKey: route?.laneKey,
        onNudgeLane,
        onRetargetEndpoint,
        connectionId: sc.id,
        dasharray: dasharrayForLineStyle(sc.lineStyle),
        filterDimmed,
        sourceHandleOffset: sourceOffsets.get(sc.id) ?? 0,
        targetHandleOffset: targetOffsets.get(sc.id) ?? 0,
      },
      style: { stroke: sc.lineColor, strokeWidth: sc.lineWidth },
      markerEnd: { type: MarkerType.ArrowClosed, color: sc.lineColor, width: 14, height: 14 },
    }
  })
}

/** How far apart (in flow px) fanned-out endpoint handles are spread from each other. */
const FAN_SPACING = 14

/**
 * routeSystemEdges deliberately makes every connection touching a given
 * node+side tap the SAME fixed pixel (see the big comment above
 * routeSystemEdges — that's what makes fan-out/fan-in read as one shared
 * trunk). RoutedEdge.tsx's endpoint-retarget handles are positioned relative
 * to that same shared tap point, so when N connections share a node+side,
 * all N handles land on the exact same pixel and only the topmost one in SVG
 * paint order is actually clickable.
 *
 * This groups connections by their ACTUAL route endpoint coordinate (not by
 * recomputing which side/category a node falls on — that would duplicate
 * routeSystemEdges' internals and risk drifting out of sync with it) and
 * assigns each member of an overlapping group a small index-based offset,
 * so RoutedEdge can fan the handles apart into a visible cluster instead of
 * a single occluded stack. Groups of size 1 get offset 0 — i.e. unchanged
 * from before this fix.
 */
function computeHandleFanOffsets(
  connections: RoadmapData['systemConnections'],
  effectiveEndpoints: Map<string, { source: string; target: string }>,
  routes: Map<string, RoutedEdgeResult>,
): { sourceOffsets: Map<string, number>; targetOffsets: Map<string, number> } {
  const groups = new Map<string, { connectionId: string; end: 'source' | 'target' }[]>()

  for (const sc of connections) {
    const route = routes.get(sc.id)
    if (!route || route.points.length < 2) continue
    const { source, target } = effectiveEndpoints.get(sc.id)!
    const first = route.points[0]
    const last = route.points[route.points.length - 1]

    const sourceKey = `${source}::${Math.round(first.x)},${Math.round(first.y)}`
    const targetKey = `${target}::${Math.round(last.x)},${Math.round(last.y)}`

    const sourceGroup = groups.get(sourceKey) ?? []
    sourceGroup.push({ connectionId: sc.id, end: 'source' })
    groups.set(sourceKey, sourceGroup)

    const targetGroup = groups.get(targetKey) ?? []
    targetGroup.push({ connectionId: sc.id, end: 'target' })
    groups.set(targetKey, targetGroup)
  }

  const sourceOffsets = new Map<string, number>()
  const targetOffsets = new Map<string, number>()

  for (const members of groups.values()) {
    if (members.length <= 1) continue
    const sorted = [...members].sort((a, b) => a.connectionId.localeCompare(b.connectionId))
    sorted.forEach((member, index) => {
      const offset = (index - (sorted.length - 1) / 2) * FAN_SPACING
      const target = member.end === 'source' ? sourceOffsets : targetOffsets
      target.set(member.connectionId, offset)
    })
  }

  return { sourceOffsets, targetOffsets }
}
