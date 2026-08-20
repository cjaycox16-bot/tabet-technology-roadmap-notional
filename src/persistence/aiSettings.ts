const STORAGE_KEY = 'tabet-roadmap-ai-key-v1'

/**
 * The user's own Anthropic API key, for the AI assistant panel. Stored only
 * in this browser's localStorage — never bundled into the build, never sent
 * anywhere but straight to Anthropic's API from this browser.
 */
export function loadApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}
