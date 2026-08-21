import { useMemo, useRef, useState, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { SparklesIcon, XIcon, SendIcon, Maximize2Icon, Minimize2Icon } from 'lucide-react'
import type { RoadmapData } from '../data/types'
import { summarizeRoadmapForAi } from '../data/summarizeForAi'
import { loadApiKey, saveApiKey, clearApiKey } from '../persistence/aiSettings'

const MODEL = 'claude-opus-5'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function systemPromptFor(data: RoadmapData): string {
  return [
    "You are a manufacturing operations & automation analyst reviewing Tabet Manufacturing's technology roadmap — a map of every stage in their shop flow, what software touches each one, and how those systems hand data to each other.",
    'Answer questions about the roadmap, and when asked for recommendations, ground them in the actual data below: call out stages with no automation/software coverage, manual handoffs between systems that could be integrated, single points of failure, and concrete next steps — reference stages by name, not just by key letter.',
    "This is notional/pending-validation data a human is still reviewing, so flag when you're inferring rather than reading a documented fact.",
    '',
    summarizeRoadmapForAi(data),
  ].join('\n')
}

/**
 * Floating chat widget, bring-your-own-key. The key lives only in this
 * browser's localStorage (persistence/aiSettings.ts) and every request goes
 * straight from the browser to Anthropic — there's no backend for this
 * static site to proxy through. That's a real tradeoff (the key is visible
 * to anyone with devtools on this browser/profile) the user chose knowingly
 * over a local rules-based alternative.
 */
export function AiAssistant({ data }: { data: RoadmapData }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [apiKey, setApiKey] = useState(() => loadApiKey())
  const [keyDraft, setKeyDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const system = useMemo(() => systemPromptFor(data), [data])
  const client = useMemo(
    () => (apiKey ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true }) : null),
    [apiKey],
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const question = input.trim()
    if (!question || !client || sending) return
    setInput('')
    setError(null)
    const history = [...messages, { role: 'user' as const, content: question }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setSending(true)

    try {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 4096,
        system,
        thinking: { type: 'adaptive' },
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      })
      stream.on('text', (delta) => {
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + delta }
          return next
        })
      })
      await stream.finalMessage()
    } catch (err) {
      let message = 'Something went wrong reaching Anthropic.'
      if (err instanceof Anthropic.AuthenticationError) message = 'That API key was rejected — check it under settings.'
      else if (err instanceof Anthropic.RateLimitError) message = 'Rate limited — wait a moment and try again.'
      else if (err instanceof Anthropic.APIError) message = `Anthropic API error: ${err.message}`
      setError(message)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#09295F] text-white shadow-lg hover:bg-[#17499F]"
        title="AI recommendations"
      >
        {open ? <XIcon className="size-5" /> : <SparklesIcon className="size-5" />}
      </button>

      {open && (
        <div
          className={`fixed bottom-20 right-5 z-40 flex flex-col overflow-hidden rounded-lg border border-[#D0DCE8] bg-white shadow-2xl ${
            expanded
              ? 'h-[50vh] max-h-[calc(100vh-160px)] w-[50vw] max-w-[90vw]'
              : 'h-[520px] w-[380px] max-w-[90vw]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#E8EFF6] bg-[#09295F] px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                title={expanded ? 'Collapse' : 'Expand'}
                className="text-white/70 hover:text-white"
              >
                {expanded ? <Minimize2Icon className="size-4" /> : <Maximize2Icon className="size-4" />}
              </button>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <SparklesIcon className="size-4" /> Roadmap assistant
              </p>
            </div>
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  clearApiKey()
                  setApiKey('')
                  setMessages([])
                }}
                className="text-xs text-white/70 hover:text-white hover:underline"
              >
                Change key
              </button>
            )}
          </div>

          {!client ? (
            <div className="flex flex-1 flex-col justify-center gap-2.5 px-4 py-4">
              <p className="text-sm text-[#3D5168]">
                Paste an Anthropic API key to ask this assistant about gaps, automation opportunities, and risks in
                the roadmap.
              </p>
              <p className="text-xs text-[#94A3B8]">
                Saved only in this browser (localStorage) and sent straight to Anthropic — never bundled into the
                site or shared with anyone else who opens it.
              </p>
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="sk-ant-..."
                className="rounded-md border border-[#D0DCE8] px-2.5 py-1.5 text-sm focus:border-[#17499F] focus:outline-none"
              />
              <button
                type="button"
                disabled={!keyDraft.trim()}
                onClick={() => {
                  saveApiKey(keyDraft.trim())
                  setApiKey(keyDraft.trim())
                  setKeyDraft('')
                }}
                className="rounded-full bg-[#09295F] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#17499F] disabled:cursor-not-allowed disabled:bg-[#D0DCE8]"
              >
                Save key
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
                {messages.length === 0 && (
                  <p className="text-xs text-[#94A3B8]">
                    Try: "Where are the biggest automation gaps?" or "What's the risk if the ERP system goes down?"
                  </p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-md px-2.5 py-1.5 text-sm ${
                      m.role === 'user' ? 'ml-6 bg-[#EDF3FC] text-[#0B1523]' : 'mr-2 bg-[#F0F5FA] text-[#0B1523]'
                    }`}
                  >
                    {m.content || (sending && i === messages.length - 1 ? '…' : '')}
                  </div>
                ))}
                {error && <p className="rounded-md bg-[#FBEAEA] px-2.5 py-1.5 text-xs text-[#B3261E]">{error}</p>}
              </div>
              <div className="flex items-center gap-1.5 border-t border-[#E8EFF6] px-2.5 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Ask about gaps, risks, automation..."
                  disabled={sending}
                  className="flex-1 rounded-full border border-[#D0DCE8] px-3 py-1.5 text-sm focus:border-[#17499F] focus:outline-none disabled:bg-[#F0F5FA]"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={sending || !input.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#09295F] text-white hover:bg-[#17499F] disabled:cursor-not-allowed disabled:bg-[#D0DCE8]"
                >
                  <SendIcon className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
