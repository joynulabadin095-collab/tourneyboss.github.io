import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import type { Role, User } from '../types'
import * as store from '../data/store'

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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false)

  useEffect(() => {
    // Finishes a signInWithRedirect flow, if we just came back from one.
    // Errors here are swallowed — onAuthStateChanged below still fires
    // normally for a plain page load with no pending redirect.
    getRedirectResult(auth).catch(() => {})

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
      } catch {
        // Signed in with Firebase but no users/{uid} doc yet — brand new account.
        setUser(null)
        setNeedsRoleSelection(true)
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  async function continueWithGoogle() {
    // Redirect (not popup) — mobile browsers block/mishandle popups, so the
    // whole page navigates to Google and back instead. Resolution happens
    // via getRedirectResult + onAuthStateChanged above after the redirect back.
    await signInWithRedirect(auth, googleProvider)
  }

  async function completeSignup(role: Role): Promise<boolean> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return false
    try {
      const idToken = await firebaseUser.getIdToken()
      const { user } = await store.googleSignIn(idToken, role)
      setUser(user)
      setNeedsRoleSelection(false)
      return true
    } catch {
      return false
    }
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
    setNeedsRoleSelection(false)
  }

  async function refresh() {
    if (!auth.currentUser) return
    try {
      const { user } = await store.fetchMe()
      setUser(user)
    } catch {
      // ignore
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, needsRoleSelection, continueWithGoogle, completeSignup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
