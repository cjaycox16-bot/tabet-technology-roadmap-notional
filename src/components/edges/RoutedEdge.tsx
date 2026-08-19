import { BaseEdge, type EdgeProps } from '@xyflow/react'
import { useRoadmap } from '../../context/RoadmapContext'
import type { RoutePoint } from '../../layout/routeSystemEdges'

const CURVE_REACH = 42
const STUB_BEND = 0.6

/**
 * Renders routeSystemEdges' 4-point route — [source tap, lane-near-source,
 * lane-near-target, target tap] — as one flowing curve instead of straight
 * segments with rounded corners. The tap stubs leave each node horizontally
 * and bend into the lane's vertical run via cubic beziers; the lane run
 * itself stays a straight vertical line (the "trunk" of the cable), the
 * same convention wiring diagrams use. Bypasses React Flow's automatic
 * handle-to-handle path calculation entirely — that's the point of
 * pre-computing the route.
 */
function flowingPath(points: RoutePoint[]): string {
  if (points.length < 2) return ''
  if (points.length !== 4) return `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`

  const [p0, p1, p2, p3] = points
  const laneLength = Math.abs(p2.y - p1.y)
  const reach = Math.min(CURVE_REACH, laneLength / 2)
  const laneDir = Math.sign(p2.y - p1.y) || 1

  const c0 = { x: p0.x + (p1.x - p0.x) * STUB_BEND, y: p0.y }
  const c1 = { x: p1.x, y: p1.y + laneDir * reach }
  const c2 = { x: p2.x, y: p2.y - laneDir * reach }
  const c3 = { x: p3.x + (p2.x - p3.x) * STUB_BEND, y: p3.y }

  return [
    `M ${p0.x} ${p0.y}`,
    `C ${c0.x} ${c0.y}, ${c1.x} ${c1.y}, ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `C ${c2.x} ${c2.y}, ${c3.x} ${c3.y}, ${p3.x} ${p3.y}`,
  ].join(' ')
}

/**
 * Opacity/weight depends on what's focused (hovered or selected) right now,
 * read live from context rather than baked in at layout time — so hovering
 * across 18 stages doesn't require re-running ELK or the bus router, just a
 * cheap re-render of these ~44 edge components.
 */
export function RoutedEdge({ id, source, target, data, markerEnd, style }: EdgeProps) {
  const { focusNodeId } = useRoadmap()
  const points = (data?.points as RoutePoint[] | undefined) ?? []
  const dasharray = data?.dasharray as string | undefined
  const filterDimmed = Boolean(data?.filterDimmed)
  if (points.length < 2) return null

  const isFocused = focusNodeId !== null && (source === focusNodeId || target === focusNodeId)
  const isEclipsed = focusNodeId !== null && !isFocused

  const baseWidth = typeof style?.strokeWidth === 'number' ? style.strokeWidth : 2
  const opacity = filterDimmed ? 0.04 : isFocused ? 0.95 : isEclipsed ? 0.04 : 0.18
  const strokeWidth = isFocused ? baseWidth + 1.5 : baseWidth

  return (
    <BaseEdge
      id={id}
      path={flowingPath(points)}
      markerEnd={markerEnd}
      style={{ ...style, strokeDasharray: dasharray, opacity, strokeWidth }}
    />
  )
}
