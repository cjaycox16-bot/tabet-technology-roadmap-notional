import { useRef, useState, type PointerEvent } from 'react'
import { BaseEdge, useReactFlow, type EdgeProps } from '@xyflow/react'
import { useRoadmap } from '../../context/RoadmapContext'
import type { RoutePoint } from '../../layout/routeSystemEdges'

const CORNER_RADIUS = 30

/**
 * Renders routeSystemEdges' route — a straight-segment polyline that may run
 * to 6 points when a tap stub had to step around a sibling node — as one
 * continuously flowing line instead of hard corners. Standard rounded-corner
 * construction: at each interior waypoint, pull back along both adjacent
 * segments by the corner radius (clamped to half the shorter segment, so
 * short detour hops never overshoot) and swap the sharp vertex for a
 * quadratic curve between the two pull-back points. Works for any number of
 * waypoints, so it doesn't care whether routeSystemEdges produced the plain
 * 4-point route or a longer one with detour corners in it. Bypasses React
 * Flow's automatic handle-to-handle path calculation entirely — that's the
 * point of pre-computing the route.
 */
function flowingPath(points: RoutePoint[], radius = CORNER_RADIUS): string {
  if (points.length < 2) return ''
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const corner = points[i]
    const next = points[i + 1]

    const inLength = Math.hypot(corner.x - prev.x, corner.y - prev.y)
    const outLength = Math.hypot(next.x - corner.x, next.y - corner.y)
    if (inLength === 0 || outLength === 0) {
      d += ` L ${corner.x} ${corner.y}`
      continue
    }
    const r = Math.min(radius, inLength / 2, outLength / 2)

    const enter = {
      x: corner.x - ((corner.x - prev.x) / inLength) * r,
      y: corner.y - ((corner.y - prev.y) / inLength) * r,
    }
    const exit = {
      x: corner.x + ((next.x - corner.x) / outLength) * r,
      y: corner.y + ((next.y - corner.y) / outLength) * r,
    }

    d += ` L ${enter.x} ${enter.y} Q ${corner.x} ${corner.y}, ${exit.x} ${exit.y}`
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
 *
 * Draggable in "Move stages" mode (connectMode off): a wide invisible path
 * layered on top catches the drag, translating the rendered line live as a
 * preview; on release it reports one delta to onNudgeLane (FlowCanvas.tsx),
 * which shifts every connection sharing this lane together and reruns the
 * real route — so siblings that aren't being dragged snap to match on
 * release rather than live (keeping the drag itself cheap: one edge
 * re-rendering per frame instead of every connection on the lane).
 */
export function RoutedEdge({ id, source, target, data, markerEnd, style }: EdgeProps) {
  const { focusNodeId, connectMode } = useRoadmap()
  const { screenToFlowPosition } = useReactFlow()
  const points = (data?.points as RoutePoint[] | undefined) ?? []
  const dasharray = data?.dasharray as string | undefined
  const filterDimmed = Boolean(data?.filterDimmed)
  const laneKey = data?.laneKey as string | undefined
  const onNudgeLane = data?.onNudgeLane as ((laneKey: string, deltaX: number) => void) | undefined
  const draggable = !connectMode && Boolean(laneKey) && Boolean(onNudgeLane)

  const dragStartFlowX = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [previewDeltaX, setPreviewDeltaX] = useState(0)

  if (points.length < 2) return null

  const isFocused = focusNodeId !== null && (source === focusNodeId || target === focusNodeId)
  const isEclipsed = focusNodeId !== null && !isFocused

  const baseWidth = typeof style?.strokeWidth === 'number' ? style.strokeWidth : 2
  const opacity = filterDimmed ? 0.04 : isFocused ? 0.95 : isEclipsed ? 0.04 : 0.18
  const strokeWidth = isFocused ? baseWidth + 1.5 : baseWidth
  const path = flowingPath(points)

  const handlePointerDown = (event: PointerEvent<SVGPathElement>) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartFlowX.current = screenToFlowPosition({ x: event.clientX, y: event.clientY }).x
    setDragging(true)
    setPreviewDeltaX(0)
  }
  const handlePointerMove = (event: PointerEvent<SVGPathElement>) => {
    if (!dragging) return
    const currentFlowX = screenToFlowPosition({ x: event.clientX, y: event.clientY }).x
    setPreviewDeltaX(currentFlowX - dragStartFlowX.current)
  }
  const endDrag = (event: PointerEvent<SVGPathElement>) => {
    if (!dragging) return
    setDragging(false)
    if (laneKey && onNudgeLane && Math.abs(previewDeltaX) > 0.5) onNudgeLane(laneKey, previewDeltaX)
    setPreviewDeltaX(0)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <g transform={dragging ? `translate(${previewDeltaX}, 0)` : undefined}>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ ...style, strokeDasharray: dasharray, opacity, strokeWidth }}
      />
      {draggable && (
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={16}
          style={{ cursor: dragging ? 'grabbing' : 'ew-resize', pointerEvents: 'stroke' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      )}
    </g>
  )
}
