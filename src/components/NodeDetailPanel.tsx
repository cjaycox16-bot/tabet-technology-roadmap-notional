import { useEffect, useState } from 'react'
import type { RoadmapData, RoadmapNode } from '../data/types'
import { findNode, isPlaceholder } from '../data/lookup'
import { applyEdits } from '../data/annotate'
import type { NodeEdits } from '../persistence/annotationStorage'
import { useRoadmap } from '../context/RoadmapContext'
import { ROLE_STYLE, STATUS_STYLE } from './nodes/roleStyles'
import { Badge } from './ui/badge'

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  const missing = isPlaceholder(value)
  return (
    <div className="mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</h3>
      <p className={`mt-0.5 text-sm ${missing ? 'italic text-[#94A3B8]' : 'text-[#3D5168]'}`}>
        {missing ? 'Not yet documented' : value}
      </p>
    </div>
  )
}

function EditField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  const shared =
    'mt-1 w-full rounded-md border border-[#D0DCE8] bg-white px-2.5 py-1.5 text-sm text-[#0B1523] focus:border-[#17499F] focus:outline-none'
  return (
    <div className="mt-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</h3>
      {multiline ? (
        <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
    </div>
  )
}

interface EditFormState {
  label: string
  detailTitle: string
  inputsSummary: string
  outputsSummary: string
  owner: string
  majorActivities: string
  qualityCheckpoints: string
  painPoints: string
  opportunity: string
  timeSavings: string
  software: Record<string, { packageName: string; currentOrFuture: string }>
}

function formStateFor(node: RoadmapNode): EditFormState {
  return {
    label: node.label,
    detailTitle: node.detailTitle,
    inputsSummary: node.inputsSummary,
    outputsSummary: node.outputsSummary,
    owner: node.process.owner,
    majorActivities: node.process.majorActivities,
    qualityCheckpoints: node.process.qualityCheckpoints,
    painPoints: node.process.painPoints,
    opportunity: node.process.opportunity,
    timeSavings: node.process.timeSavings,
    software: Object.fromEntries(
      node.software.map((s) => [s.category, { packageName: s.packageName, currentOrFuture: s.currentOrFuture }]),
    ),
  }
}

/**
 * The full "everything about this stage" view: role/status badges, the
 * validated/pending toggle, every documented field (with an edit mode that
 * writes overrides to browser storage rather than touching the Excel-sourced
 * data), connected systems, and a save-able notes box. Shared by DetailDrawer
 * (the side panel opened from the canvas) and ValidationDashboard (the full
 * review list) so editing/validating behaves identically from either place.
 */
export function NodeDetailPanel({ data, id }: { data: RoadmapData; id: string }) {
  const { getAnnotation, setValidated, saveNotes, saveEdits } = useRoadmap()
  const rawNode = findNode(data, id)
  const annotation = getAnnotation(id)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditFormState | null>(null)
  const [notesDraft, setNotesDraft] = useState(annotation.notes)
  const [notesSaved, setNotesSaved] = useState(true)

  useEffect(() => {
    setNotesDraft(annotation.notes)
    setNotesSaved(true)
    setEditing(false)
    setForm(null)
    // Reset local editor state whenever the panel switches to a different stage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!rawNode) return null
  const node = applyEdits(rawNode, annotation.edits)
  const role = ROLE_STYLE[node.role]
  const status = STATUS_STYLE[node.status]
  const outgoing = data.systemConnections.filter((c) => c.source === id)
  const incoming = data.systemConnections.filter((c) => c.target === id)

  const startEditing = () => {
    setForm(formStateFor(node))
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setForm(null)
  }

  const saveEditing = () => {
    if (!form) return
    const edits: NodeEdits = {
      label: form.label,
      detailTitle: form.detailTitle,
      inputsSummary: form.inputsSummary,
      outputsSummary: form.outputsSummary,
      process: {
        owner: form.owner,
        majorActivities: form.majorActivities,
        qualityCheckpoints: form.qualityCheckpoints,
        painPoints: form.painPoints,
        opportunity: form.opportunity,
        timeSavings: form.timeSavings,
      },
      software: form.software,
    }
    saveEdits(id, edits)
    setEditing(false)
    setForm(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant="outline"
          className="gap-1.5 rounded-full px-2.5 py-1"
          style={{ borderColor: role.accent, color: role.accent }}
        >
          {role.label}
        </Badge>
        <Badge variant="secondary" className="gap-1.5 rounded-full px-2.5 py-1 text-[#3D5168]">
          <span className="h-2 w-2 rounded-full" style={{ background: status.dot }} />
          {status.label}
        </Badge>

        <button
          type="button"
          onClick={() => setValidated(id, !annotation.validated)}
          className={`ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
            annotation.validated
              ? 'border-[#047857] bg-[#047857] text-white'
              : 'border-[#C8890A] bg-[#FBF1E0] text-[#7A5205]'
          }`}
          title={annotation.validated ? 'Click to mark as needing review again' : 'Click to confirm this is accurate'}
        >
          {annotation.validated ? '✓ Validated' : 'Pending validation'}
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-full border border-[#D0DCE8] px-2.5 py-1 text-xs font-medium text-[#3D5168] hover:bg-[#F0F5FA]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEditing}
              className="rounded-full bg-[#09295F] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#17499F]"
            >
              Save changes
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="rounded-full border border-[#D0DCE8] px-2.5 py-1 text-xs font-medium text-[#3D5168] hover:bg-[#F0F5FA]"
          >
            Edit details
          </button>
        )}
      </div>

      {editing && form ? (
        <>
          <EditField label="Stage name" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
          <EditField
            label="Detail title"
            value={form.detailTitle}
            onChange={(v) => setForm({ ...form, detailTitle: v })}
          />
          <EditField label="Owner" value={form.owner} onChange={(v) => setForm({ ...form, owner: v })} />
          <EditField
            label="Inputs"
            value={form.inputsSummary}
            onChange={(v) => setForm({ ...form, inputsSummary: v })}
            multiline
          />
          <EditField
            label="Major activities"
            value={form.majorActivities}
            onChange={(v) => setForm({ ...form, majorActivities: v })}
            multiline
          />
          <EditField
            label="Outputs"
            value={form.outputsSummary}
            onChange={(v) => setForm({ ...form, outputsSummary: v })}
            multiline
          />
          <EditField
            label="Quality checkpoints"
            value={form.qualityCheckpoints}
            onChange={(v) => setForm({ ...form, qualityCheckpoints: v })}
            multiline
          />
          <EditField
            label="Pain points"
            value={form.painPoints}
            onChange={(v) => setForm({ ...form, painPoints: v })}
            multiline
          />
          <EditField
            label="Opportunity"
            value={form.opportunity}
            onChange={(v) => setForm({ ...form, opportunity: v })}
            multiline
          />
          <EditField
            label="Time savings estimate"
            value={form.timeSavings}
            onChange={(v) => setForm({ ...form, timeSavings: v })}
          />
        </>
      ) : (
        <>
          <Field label="Owner" value={node.process.owner} />
          <Field label="Inputs" value={node.process.inputs || node.inputsSummary} />
          <Field label="Major activities" value={node.process.majorActivities} />
          <Field label="Outputs" value={node.process.outputs || node.outputsSummary} />
          <Field label="Quality checkpoints" value={node.process.qualityCheckpoints} />
          <Field label="Pain points" value={node.process.painPoints} />
          <Field label="Time savings estimate" value={node.process.timeSavings} />

          {!isPlaceholder(node.process.opportunity) && (
            <p className="mt-3 rounded-md bg-[#FBF1E0] px-3 py-2 text-xs text-[#7A5205]">
              <span className="font-semibold">Opportunity: </span>
              {node.process.opportunity}
            </p>
          )}
        </>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
          Software & systems ({node.software.length})
        </h3>
        <ul className="mt-2 space-y-2">
          {node.software.map((s) => {
            const missing = isPlaceholder(s.packageName)
            return (
              <li key={s.category} className="rounded-md border border-[#E8EFF6] px-2.5 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[#0B1523]">{s.category}</span>
                  {editing && form ? (
                    <input
                      type="text"
                      value={form.software[s.category]?.currentOrFuture ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          software: {
                            ...form.software,
                            [s.category]: {
                              packageName: form.software[s.category]?.packageName ?? '',
                              currentOrFuture: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-20 rounded border border-[#D0DCE8] px-1.5 py-0.5 text-[9px] text-[#3D5168]"
                    />
                  ) : (
                    <Badge variant="secondary" className="rounded px-1.5 py-0 text-[9px] text-[#3D5168]">
                      {s.currentOrFuture}
                    </Badge>
                  )}
                </div>
                {editing && form ? (
                  <input
                    type="text"
                    value={form.software[s.category]?.packageName ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        software: {
                          ...form.software,
                          [s.category]: {
                            currentOrFuture: form.software[s.category]?.currentOrFuture ?? '',
                            packageName: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="System / package name"
                    className="mt-1 w-full rounded border border-[#D0DCE8] px-2 py-1 text-xs text-[#0B1523]"
                  />
                ) : (
                  <p className={`mt-0.5 text-xs ${missing ? 'italic text-[#94A3B8]' : 'text-[#3D5168]'}`}>
                    {missing ? 'Not yet identified' : s.packageName}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {(outgoing.length > 0 || incoming.length > 0) && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            Connected systems ({outgoing.length + incoming.length})
          </h3>
          <ul className="mt-2 space-y-2">
            {outgoing.map((c) => (
              <SystemConnectionRow key={c.id} data={data} connection={c} direction="out" />
            ))}
            {incoming.map((c) => (
              <SystemConnectionRow key={c.id} data={data} connection={c} direction="in" />
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Notes</h3>
        <textarea
          rows={4}
          value={notesDraft}
          onChange={(e) => {
            setNotesDraft(e.target.value)
            setNotesSaved(false)
          }}
          placeholder="Anything worth flagging for whoever reviews this next..."
          className="mt-1 w-full rounded-md border border-[#D0DCE8] bg-white px-2.5 py-1.5 text-sm text-[#0B1523] focus:border-[#17499F] focus:outline-none"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            disabled={notesSaved}
            onClick={() => {
              saveNotes(id, notesDraft)
              setNotesSaved(true)
            }}
            className="rounded-full bg-[#09295F] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#17499F] disabled:cursor-not-allowed disabled:bg-[#D0DCE8] disabled:text-[#94A3B8]"
          >
            Save note
          </button>
          {notesSaved && annotation.notesUpdatedAt && (
            <span className="text-[11px] text-[#94A3B8]">
              Saved {new Date(annotation.notesUpdatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SystemConnectionRow({
  data,
  connection,
  direction,
}: {
  data: RoadmapData
  connection: RoadmapData['systemConnections'][number]
  direction: 'in' | 'out'
}) {
  const counterpart = findNode(data, direction === 'out' ? connection.target : connection.source)
  return (
    <li className="rounded-md border border-[#E8EFF6] px-2.5 py-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-medium text-[#0B1523]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: connection.lineColor }} />
          {connection.systemName}
        </span>
        <Badge variant="secondary" className="shrink-0 rounded px-1.5 py-0 text-[9px] text-[#3D5168]">
          {connection.systemCategory}
        </Badge>
      </div>
      <p className="mt-0.5 text-xs text-[#3D5168]">
        {direction === 'out' ? 'Sends to' : 'Receives from'}{' '}
        <span className="font-medium">{counterpart?.label ?? connection.target}</span>
      </p>
      <p className="mt-0.5 text-xs text-[#6B82A0]">{connection.dataTransmitted}</p>
    </li>
  )
}
