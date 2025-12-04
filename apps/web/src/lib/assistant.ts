export type AssistantRole = 'user' | 'assistant'

export interface AssistantMessage {
  role: AssistantRole
  content: string
}

export interface AssistantTaskSuggestion {
  title: string
  notes?: string
  due_at?: string
}

export interface AssistantResponse {
  reply: string
  tasks: AssistantTaskSuggestion[]
}

const SYSTEM_PROMPT = `
Eres un asistente para la app de tareas Azahar.
Solo responde en JSON con la forma:
{
  "reply": "Texto breve para el usuario",
  "tasks": [
    { "title": "Título", "notes": "Notas opcionales", "due_at": "YYYY-MM-DD" }
  ]
}
Siempre devuelve "tasks" (puede ser un array vacío). Si no hay fecha, omite "due_at".`

const parseAssistantPayload = (raw: string): AssistantResponse => {
  try {
    const parsed = JSON.parse(raw)
    const reply = typeof parsed.reply === 'string' ? parsed.reply : raw
    const tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((task: unknown) => {
            if (typeof task !== 'object' || task === null) return null
            const title = (task as { title?: unknown }).title
            if (typeof title !== 'string' || !title.trim()) return null
            const notes = (task as { notes?: unknown }).notes
            const due_at = (task as { due_at?: unknown }).due_at
            return {
              title: title.trim(),
              notes: typeof notes === 'string' ? notes : undefined,
              due_at: typeof due_at === 'string' ? due_at : undefined,
            }
          })
          .filter(Boolean) as AssistantTaskSuggestion[]
      : []
    return { reply, tasks }
  } catch {
    return { reply: raw, tasks: [] }
  }
}

export async function requestAssistantCompletion(messages: AssistantMessage[]): Promise<AssistantResponse> {
  const apiKey = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Configura VITE_OPENAI_API_KEY para habilitar el chat con IA')
  }

  const model =
    ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_OPENAI_MODEL as string | undefined) ||
    'gpt-4o-mini'
  const apiBase =
    ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_OPENAI_API_BASE as string | undefined) ||
    'https://api.openai.com/v1'

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`No se pudo obtener respuesta del asistente (${response.status}): ${errorBody}`)
  }

  const json = await response.json()
  const content: string = json?.choices?.[0]?.message?.content ?? ''
  return parseAssistantPayload(content.trim())
}
