const STORAGE_KEY = 'tabet-roadmap-system-endpoints-v1'

/** A user-dragged correction to which node a system/data-flow connection's source and/or target actually terminates at — a diagram-only override, not an edit to the canonical SystemConnection data (see NodeDetailPanel.tsx, which still reads the original data). */
export interface SystemEndpointOverride {
  source?: string
  target?: string
}

/** Keyed by SystemConnection.id. */
export type SystemEndpointOverrides = Record<string, SystemEndpointOverride>

/** Browser-local only — not shared across devices or committed to the repo. */
export function loadSystemEndpointOverrides(): SystemEndpointOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveSystemEndpointOverrides(overrides: SystemEndpointOverrides): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

export function clearSystemEndpointOverrides(): void {
  localStorage.removeItem(STORAGE_KEY)
}
