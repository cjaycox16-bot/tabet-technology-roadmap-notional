const STORAGE_KEY = 'tabet-roadmap-lane-offsets-v1'

/** Per-lane horizontal nudge, in flow px, keyed by the same `${category}::${componentRoot}` key routeSystemEdges.ts groups connections by. */
export type LaneOffsets = Record<string, number>

/** Browser-local only — not shared across devices or committed to the repo. */
export function loadLaneOffsets(): LaneOffsets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveLaneOffsets(offsets: LaneOffsets): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offsets))
}

export function clearLaneOffsets(): void {
  localStorage.removeItem(STORAGE_KEY)
}
