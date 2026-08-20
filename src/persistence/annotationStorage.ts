import type { ProcessDetail, SoftwareEntry } from '../data/types'

/** Editable overrides for a node's Excel-sourced fields — see data/annotate.ts for how these apply. */
export interface NodeEdits {
  label?: string
  detailTitle?: string
  inputsSummary?: string
  outputsSummary?: string
  process?: Partial<ProcessDetail>
  /** Keyed by software category (e.g. "ERP/MRP System"), matching SoftwareEntry.category. */
  software?: Record<string, Partial<Pick<SoftwareEntry, 'packageName' | 'currentOrFuture'>>>
}

export interface NodeAnnotation {
  validated: boolean
  notes: string
  notesUpdatedAt?: string
  edits: NodeEdits
}

export interface AnnotationStore {
  nodes: Record<string, NodeAnnotation>
}

const STORAGE_KEY = 'tabet-roadmap-annotations-v1'

export function emptyAnnotation(): NodeAnnotation {
  return { validated: false, notes: '', edits: {} }
}

/** Browser-local only — not shared across devices or committed to the repo. */
export function loadAnnotations(): AnnotationStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { nodes: {} }
    const parsed = JSON.parse(raw)
    return { nodes: parsed.nodes ?? {} }
  } catch {
    return { nodes: {} }
  }
}

export function saveAnnotations(store: AnnotationStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function getAnnotation(store: AnnotationStore, nodeId: string): NodeAnnotation {
  return store.nodes[nodeId] ?? emptyAnnotation()
}
