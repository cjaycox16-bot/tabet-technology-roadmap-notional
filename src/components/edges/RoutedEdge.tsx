import { BaseEdge, type EdgeProps } from '@xyflow/react'
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

export function RoutedEdge({ id, data, markerEnd, style }: EdgeProps) {
  const points = (data?.points as RoutePoint[] | undefined) ?? []
  const dasharray = data?.dasharray as string | undefined
  if (points.length < 2) return null

  return <BaseEdge id={id} path={roundedPath(points)} markerEnd={markerEnd} style={{ ...style, strokeDasharray: dasharray }} />
}
