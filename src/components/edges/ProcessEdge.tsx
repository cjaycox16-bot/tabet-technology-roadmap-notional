import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from '@xyflow/react'

/**
 * Same visual shape as React Flow's built-in `smoothstep` edge, but renders
 * its label through `EdgeLabelRenderer` (a DOM layer positioned above the
 * whole SVG canvas) instead of the default inline SVG text. The 4 process
 * edges leaving Project Management ("Release to welding/laser/bending/
 * machining") share an overlapping horizontal run, and with the default
 * label rendering, whichever edge painted later in SVG order visually
 * covered the earlier edges' label text with its own stroke. Labels here
 * can't be covered by any edge's path, no matter the paint order.
 */
export function ProcessEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  labelStyle,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    // Default (5) reads as a near-right-angle at this node scale, especially
    // where several edges fan out side by side (Project Management ->
    // welding/laser/bending/machining). A bigger radius turns that into an
    // actual smooth bend instead of a corner with the edges shaved off.
    borderRadius: 24,
  })

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute rounded px-1.5 py-0.5 text-[11px] font-semibold"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: '#fff',
              color: (labelStyle?.fill as string) ?? '#0B1523',
              opacity: typeof style?.opacity === 'number' ? style.opacity : 1,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
