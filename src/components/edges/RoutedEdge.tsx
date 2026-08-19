import { BaseEdge, type EdgeProps } from '@xyflow/react'
import { useRoadmap } from '../../context/RoadmapContext'
import type { RoutePoint } from '../../layout/routeSystemEdges'

/**
 * Renders the exact polyline routeSystemEdges computed for this connection,
 * with sharp corners softened into short curves. Bypasses React Flow's
 * automatic handle-to-handle path calculation entirely — that's the point
 * of pre-computing the route.
 */
function roundedPath(points: RoutePoint[], radius = 14): string {
  if (points.length < 2) return ''
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y }
    const toNext = { x: next.x - curr.x, y: next.y - curr.y }
    const prevLen = Math.hypot(toPrev.x, toPrev.y) || 1
    const nextLen = Math.hypot(toNext.x, toNext.y) || 1
    const r = Math.min(radius, prevLen / 2, nextLen / 2)

    const cornerStart = { x: curr.x + (toPrev.x / prevLen) * r, y: curr.y + (toPrev.y / prevLen) * r }
    const cornerEnd = { x: curr.x + (toNext.x / nextLen) * r, y: curr.y + (toNext.y / nextLen) * r }

    d += ` L ${cornerStart.x} ${cornerStart.y} Q ${curr.x} ${curr.y} ${cornerEnd.x} ${cornerEnd.y}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
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
      path={roundedPath(points)}
      markerEnd={markerEnd}
      style={{ ...style, strokeDasharray: dasharray, opacity, strokeWidth }}
    />
  )
}
