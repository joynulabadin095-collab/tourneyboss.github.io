import { auth } from '../firebase'

// Talks to the Tourney Boss backend (Node/Express + Firestore) deployed on Render.
const API_BASE_URL = 'https://tourneyboss-backend.onrender.com'

async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong')
  return data as T
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' })
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
    }

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
}
