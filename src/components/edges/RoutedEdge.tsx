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
/** Radius of the small circular endpoint-retarget handles rendered at each end of the line. */
const ENDPOINT_HANDLE_RADIUS = 5

/**
 * How far (in flow px) an endpoint handle sits back from the line's actual
 * tap point, along the line itself. The tap point (routeSystemEdges.ts)
 * lands exactly ON the node's border, and React Flow paints the nodes pane
 * on top of the edges pane — so a handle drawn exactly at the tap would sit
 * underneath the node's own draggable surface and never receive a pointer
 * event. Nudging it this far out along the first/last route segment (well
 * short of the STUB_LENGTH bend point) keeps it visually "at the end of the
 * line" while landing on open canvas where it's actually clickable.
 */
const ENDPOINT_HANDLE_SETBACK = 12

function setBackPoint(tap: RoutePoint, next: RoutePoint, distance: number): RoutePoint {
  const dx = next.x - tap.x
  const dy = next.y - tap.y
  const length = Math.hypot(dx, dy)
  if (length === 0) return tap
  const d = Math.min(distance, length)
  return { x: tap.x + (dx / length) * d, y: tap.y + (dy / length) * d }
}

/**
 * Offset perpendicular to the a->b segment, scaled by `offset` — used to fan
 * apart endpoint handles that share the exact same node+side tap point (see
 * systemFlowEdges.ts's computeHandleFanOffsets) into a small visible cluster
 * instead of a single occluded stack.
 */
function perpendicularOffset(a: RoutePoint, b: RoutePoint, offset: number): RoutePoint {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len === 0 || offset === 0) return { x: 0, y: 0 }
  return { x: (-dy / len) * offset, y: (dx / len) * offset }
}

type EndpointDrag = { end: 'source' | 'target'; point: RoutePoint }

export function RoutedEdge({ id, source, target, data, markerEnd, style }: EdgeProps) {
  const { focusNodeId, connectMode } = useRoadmap()
  const { screenToFlowPosition, getNodes } = useReactFlow()
  const points = (data?.points as RoutePoint[] | undefined) ?? []
  const dasharray = data?.dasharray as string | undefined
  const filterDimmed = Boolean(data?.filterDimmed)
  const laneKey = data?.laneKey as string | undefined
  const onNudgeLane = data?.onNudgeLane as ((laneKey: string, deltaX: number) => void) | undefined
  const onRetargetEndpoint = data?.onRetargetEndpoint as
    | ((connectionId: string, end: 'source' | 'target', newNodeId: string) => void)
    | undefined
  const connectionId = (data?.connectionId as string | undefined) ?? id
  const sourceHandleOffset = (data?.sourceHandleOffset as number | undefined) ?? 0
  const targetHandleOffset = (data?.targetHandleOffset as number | undefined) ?? 0
  const draggable = !connectMode && Boolean(laneKey) && Boolean(onNudgeLane)
  const endpointsEditable = !connectMode && Boolean(onRetargetEndpoint)

  const dragStartFlowX = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [previewDeltaX, setPreviewDeltaX] = useState(0)

  // Endpoint-retarget drag — separate from the whole-line lane-nudge drag
  // above. Lets the user grab either end of the line and drop it on a
  // different node to change which node the underlying SystemConnection
  // (systemFlowEdges.ts) is drawn as terminating at. Purely a diagram
  // correction — see systemEndpointStorage.ts.
  const [endpointDrag, setEndpointDrag] = useState<EndpointDrag | null>(null)

  if (points.length < 2) return null

  const isFocused = focusNodeId !== null && (source === focusNodeId || target === focusNodeId)
  const isEclipsed = focusNodeId !== null && !isFocused

  const baseWidth = typeof style?.strokeWidth === 'number' ? style.strokeWidth : 2
  const opacity = filterDimmed ? 0.04 : isFocused ? 0.95 : isEclipsed ? 0.04 : 0.18
  const strokeWidth = isFocused ? baseWidth + 1.5 : baseWidth
  const strokeColor = typeof style?.stroke === 'string' ? style.stroke : '#94A3B8'
  // Endpoint handles stay comfortably visible/grabbable at rest (unlike the
  // line itself, which is deliberately faint until hovered) — they only fade
  // when a DIFFERENT node is focused, same as the line, so they don't
  // clutter the view while the user is inspecting something else.
  const handleOpacity = filterDimmed ? 0.1 : isEclipsed ? 0.25 : 1

  const previewPoints = endpointDrag
    ? points.map((p, i) => {
        if (endpointDrag.end === 'source' && i === 0) return endpointDrag.point
        if (endpointDrag.end === 'target' && i === points.length - 1) return endpointDrag.point
        return p
      })
    : points
  const path = flowingPath(previewPoints)

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

  const handleEndpointPointerDown = (end: 'source' | 'target') => (event: PointerEvent<SVGCircleElement>) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = end === 'source' ? points[0] : points[points.length - 1]
    setEndpointDrag({ end, point })
  }
  const handleEndpointPointerMove = (event: PointerEvent<SVGCircleElement>) => {
    if (!endpointDrag) return
    const flowPoint = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    setEndpointDrag({ ...endpointDrag, point: flowPoint })
  }
  const endEndpointDrag = (event: PointerEvent<SVGCircleElement>) => {
    if (!endpointDrag) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    const dropPoint = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const otherEndNodeId = endpointDrag.end === 'source' ? target : source
    const currentNodeId = endpointDrag.end === 'source' ? source : target
    const foundNode = getNodes().find((n) => {
      const width = typeof n.measured?.width === 'number' ? n.measured.width : (n.width ?? 0)
      const height = typeof n.measured?.height === 'number' ? n.measured.height : (n.height ?? 0)
      return (
        dropPoint.x >= n.position.x &&
        dropPoint.x <= n.position.x + width &&
        dropPoint.y >= n.position.y &&
        dropPoint.y <= n.position.y + height
      )
    })
    if (foundNode && foundNode.id !== otherEndNodeId && foundNode.id !== currentNodeId && onRetargetEndpoint) {
      onRetargetEndpoint(connectionId, endpointDrag.end, foundNode.id)
    }
    setEndpointDrag(null)
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
      {endpointsEditable && (
        <>
          {(['source', 'target'] as const).map((end) => {
            const isDraggingThis = endpointDrag?.end === end
            // At rest, set back from the true tap point so the handle isn't
            // occluded by the node it's touching (see ENDPOINT_HANDLE_SETBACK).
            // Mid-drag, follow the pointer exactly so the preview tracks the
            // cursor precisely.
            const point = isDraggingThis
              ? endpointDrag.point
              : end === 'source'
                ? (() => {
                    const setBack = setBackPoint(points[0], points[1], ENDPOINT_HANDLE_SETBACK)
                    const fan = perpendicularOffset(points[0], points[1], sourceHandleOffset)
                    return { x: setBack.x + fan.x, y: setBack.y + fan.y }
                  })()
                : (() => {
                    const setBack = setBackPoint(
                      points[points.length - 1],
                      points[points.length - 2],
                      ENDPOINT_HANDLE_SETBACK,
                    )
                    const fan = perpendicularOffset(points[points.length - 1], points[points.length - 2], targetHandleOffset)
                    return { x: setBack.x + fan.x, y: setBack.y + fan.y }
                  })()
            return (
              <circle
                key={end}
                cx={point.x}
                cy={point.y}
                r={ENDPOINT_HANDLE_RADIUS}
                fill="white"
                stroke={strokeColor}
                strokeWidth={2}
                style={{ cursor: isDraggingThis ? 'grabbing' : 'grab', pointerEvents: 'all', opacity: handleOpacity }}
                onPointerDown={handleEndpointPointerDown(end)}
                onPointerMove={handleEndpointPointerMove}
                onPointerUp={endEndpointDrag}
                onPointerCancel={endEndpointDrag}
              />
            )
          })}
        </>
      )}
    </g>
  )
}
