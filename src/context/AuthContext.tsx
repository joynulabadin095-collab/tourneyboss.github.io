import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import type { Role, User } from '../types'
import * as store from '../data/store'

// Shape we expose to the UI for any auth error so the page can show the
// *exact* reason (Firebase code, human message, root cause when available).
export interface AuthErrorDetail {
  code: string           // Firebase code, e.g. 'auth/popup-closed-by-user'
  message: string        // raw error.message from Firebase
  cause?: string         // underlying cause.message if Firebase wrapped one
  stack?: string         // dev-only stack
  at: string             // step where it happened ('googlePopup' | 'fetchMe' | 'completeSignup' | 'logout' | 'refresh')
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  // true once signed in with Google but the users/{uid} doc doesn't exist yet
  // (brand-new account) — the UI should ask "Player or Organizer?" and call
  // completeSignup with the answer.
  needsRoleSelection: boolean
  continueWithGoogle: () => Promise<void>
  completeSignup: (role: Role) => Promise<boolean>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateProfile: (data: { name: string; phone: string }) => Promise<void>
  // Last error from any of the auth flows (or null). The Login page reads this
  // and renders a readable cause. Cleared on next successful action.
  lastError: AuthErrorDetail | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Firebase errors are plain Error instances with a `code` field
// (e.g. 'auth/popup-closed-by-user') and sometimes a `cause`.
interface FirebaseLikeError extends Error {
  code?: string
  cause?: unknown
}

function toAuthError(err: unknown, at: AuthErrorDetail['at']): AuthErrorDetail {
  if (err instanceof Error) {
    const firebaseErr = err as FirebaseLikeError
    // FirebaseError extends Error with a `code` (e.g. 'auth/popup-closed-by-user')
    // and sometimes a `cause` (the underlying network/HTTP error).
    const cause = firebaseErr.cause
    return {
      code: firebaseErr.code || 'unknown',
      message: err.message || 'Unknown error',
      cause: cause instanceof Error ? cause.message : undefined,
      stack: err.stack,
      at,
    }
  }
  return {
    code: 'unknown',
    message: typeof err === 'string' ? err : 'Unknown error',
    at,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false)
  const [lastError, setLastError] = useState<AuthErrorDetail | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (!firebaseUser) {
        setUser(null)
        setNeedsRoleSelection(false)
        setLoading(false)
        return
      }
      try {
        const { user } = await store.fetchMe()
        setUser(user)
        setNeedsRoleSelection(false)
        setLastError(null)
      } catch (err) {
        // Signed in with Firebase but no users/{uid} doc yet — brand new account.
        setUser(null)
        setNeedsRoleSelection(true)
        // Don't surface this as an error: it's a normal "first time" flow.
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  async function continueWithGoogle() {
    setLastError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      // onAuthStateChanged above will pick this up and resolve fetchMe/needsRoleSelection.
    } catch (err) {
      const detail = toAuthError(err, 'googlePopup')
      setLastError(detail)
      throw err
    }
  }

  async function completeSignup(role: Role): Promise<boolean> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return false
    setLastError(null)
    try {
      const idToken = await firebaseUser.getIdToken()
      const { user } = await store.googleSignIn(idToken, role)
      setUser(user)
      setNeedsRoleSelection(false)
      return true
    } catch (err) {
      const detail = toAuthError(err, 'completeSignup')
      setLastError(detail)
      return false
    }
  }

  async function logout() {
    setLastError(null)
    try {
      await signOut(auth)
      setUser(null)
      setNeedsRoleSelection(false)
    } catch (err) {
      setLastError(toAuthError(err, 'logout'))
    }
  }

  async function refresh() {
    if (!auth.currentUser) return
    try {
      const { user } = await store.fetchMe()
      setUser(user)
    } catch (err) {
      setLastError(toAuthError(err, 'refresh'))
    }
  }

  async function updateProfile(data: { name: string; phone: string }) {
    setLastError(null)
    try {
      const updated = await store.updateMyProfile(data)
      setUser(updated)
    } catch (err) {
      const detail = toAuthError(err, 'updateProfile')
      setLastError(detail)
      throw err
    }
  }

  function clearError() {
    setLastError(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, needsRoleSelection,
      continueWithGoogle, completeSignup, logout, refresh,
      updateProfile, lastError, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
