import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Role, User } from '../types'
import * as store from '../data/store'

interface AuthContextValue {
  user: User | null
  login: (phone: string) => boolean
  register: (name: string, phone: string, role: Role) => void
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(store.getSessionUser())
  }, [])

  function login(phone: string): boolean {
    const found = store.findUserByPhone(phone)
    if (!found) return false
    store.setSessionUser(found.id)
    setUser(found)
    return true
  }

  function register(name: string, phone: string, role: Role) {
    const newUser: User = {
      id: store.newId('user'),
      name,
      phone,
      role,
      walletBalance: 0,
    }
    store.saveUser(newUser)
    store.setSessionUser(newUser.id)
    setUser(newUser)
  }

  function logout() {
    store.setSessionUser(null)
    setUser(null)
  }

  function refresh() {
    setUser(store.getSessionUser())
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
