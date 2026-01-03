import { useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { AssistantMessage, AssistantResponse } from '../../lib/assistant.js'
import { requestAssistantCompletion } from '../../lib/assistant.js'
import { addTask } from '../../lib/supabase.js'

interface AssistantChatProps {
  open: boolean
  onClose: () => void
}

const toISODate = (value?: string) => {
  if (!value) return undefined
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return undefined
  return new Date(parsed).toISOString()
}

export default function AssistantChat({ open, onClose }: AssistantChatProps) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content: 'Hola, soy tu asistente. Cuéntame qué tareas quieres crear y me encargo.',
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const canSend = input.trim().length > 0 && !isSending

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  const handleAssistantReply = async (draft: AssistantMessage[]): Promise<AssistantResponse> => {
    const response = await requestAssistantCompletion(draft)
    setMessages((prev) => [...prev, { role: 'assistant', content: response.reply }])
    scrollToBottom()

    if (response.tasks.length > 0) {
      setStatus(`Creando ${response.tasks.length} tarea(s)...`)
      let created = 0
      for (const task of response.tasks) {
        const result = await addTask(task.title, task.notes, 0, toISODate(task.due_at))
        if (result.success) {
          created += 1
        }
      }
      if (created > 0) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] })
        setStatus(`Se crearon ${created} tarea(s).`)
      } else {
        setStatus('No se pudieron crear las tareas sugeridas.')
      }
    } else {
      setStatus(null)
    }

    return response
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!canSend) return
    const userMessage: AssistantMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsSending(true)
    setStatus(null)
    scrollToBottom()
    try {
      await handleAssistantReply([...messages, userMessage])
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'No se pudo obtener respuesta del asistente.')
    } finally {
      setIsSending(false)
    }
  }

  const containerClass = useMemo(
    () =>
      `fixed inset-0 z-40 flex items-end justify-end px-4 pb-4 sm:pb-8 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`,
    [open]
  )

  if (!open) return null

  return (
    <div className={containerClass}>
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-container)] shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
          <div>
            <p className="text-sm font-semibold text-[var(--on-surface)]">Asistente IA</p>
            <p className="text-xs text-[var(--color-text-muted)]">Pide que cree tareas por ti</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-11 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)] flex items-center justify-center"
            aria-label="Cerrar chat"
          >
            ×
          </button>
        </header>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
              className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={
                  message.role === 'user'
                    ? 'max-w-[90%] rounded-[var(--radius-container)] bg-[var(--color-primary-100)] text-[var(--on-surface)] px-3 py-2 text-sm'
                    : 'max-w-[90%] rounded-[var(--radius-container)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--on-surface)] px-3 py-2 text-sm'
                }
              >
                {message.content}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="text-xs text-[var(--color-text-muted)]">Consultando ChatGPT...</div>
          )}
          {status && <div className="text-xs text-[var(--color-primary-700)]">{status}</div>}
          <div ref={endRef} />
        </div>
        <form onSubmit={handleSubmit} className="border-t border-[var(--color-border)] p-3 space-y-2">
          <textarea
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ej: crea 2 tareas para mañana sobre revisar métricas y enviar informe"
            className="w-full rounded-[var(--radius-card)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-3 py-2 text-sm rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] hover:opacity-90 disabled:opacity-50"
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
