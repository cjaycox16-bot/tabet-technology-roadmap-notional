const STORAGE_KEY = 'tabet-roadmap-layout-v2'

export interface StoredPosition {
  x: number
  y: number
}

/** A user-drawn connector — separate from data-driven edges in roadmapData.ts. */
export interface StoredCustomEdge {
  id: string
  source: string
  sourceHandle?: string | null
  target: string
  targetHandle?: string | null
  /** One of SYSTEM_CATEGORY_ORDER (systemStyle.ts), picked at draw time so this connector inherits that category's real styling. Undefined = generic "Manual" style. */
  category?: string
}

export interface StoredLayout {
  positions: Record<string, StoredPosition>
  customEdges: StoredCustomEdge[]
}

function emptyLayout(): StoredLayout {
  return { positions: {}, customEdges: [] }
}

/** Browser-local only — not shared across devices or committed to the repo. */
export function loadLayout(): StoredLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyLayout()
    const parsed = JSON.parse(raw)
    return {
      positions: parsed.positions ?? {},
      customEdges: parsed.customEdges ?? [],
    }
  } catch {
    return emptyLayout()
  }
}

export function saveLayout(layout: StoredLayout): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
}

export function clearLayout(): void {
  localStorage.removeItem(STORAGE_KEY)
}
