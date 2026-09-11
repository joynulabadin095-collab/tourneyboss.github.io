// Temporary local data layer (browser localStorage).
// TODO: replace every function body here with real fetch() calls
// to the Node/TS backend on Render once it is deployed. Keep the
// same function names/signatures so pages don't need to change.

import type {
  User, Tournament, EntryPayment, HostingRequest, CashoutRequest,
} from '../types'

const KEYS = {
  users: 'tb_users',
  tournaments: 'tb_tournaments',
  entryPayments: 'tb_entry_payments',
  hostingRequests: 'tb_hosting_requests',
  cashouts: 'tb_cashouts',
  session: 'tb_session_user_id',
}

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function seedIfEmpty() {
  if (localStorage.getItem(KEYS.users)) return

  const users: User[] = [
    { id: 'admin-1', name: 'Admin', phone: '01700000000', role: 'admin', walletBalance: 0 },
    { id: 'org-1', name: 'Rafiq Host', phone: '01711111111', role: 'organizer', walletBalance: 0 },
    { id: 'player-1', name: 'Karim Player', phone: '01722222222', role: 'player', walletBalance: 150 },
  ]

  const tournaments: Tournament[] = [
    {
      id: 't-1', title: 'Free Fire Weekend Clash', game: 'Free Fire',
      organizerId: 'org-1', organizerName: 'Rafiq Host',
      entryFee: 50, prizePool: 2000, maxSlots: 48, filledSlots: 12,
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      status: 'open', hostingApproved: true,
      rules: 'Squad mode, no emulator, screenshots required after match.',
    },
  ]

  write(KEYS.users, users)
  write(KEYS.tournaments, tournaments)
  write(KEYS.entryPayments, [] as EntryPayment[])
  write(KEYS.hostingRequests, [] as HostingRequest[])
  write(KEYS.cashouts, [] as CashoutRequest[])
}

seedIfEmpty()

// --- Users / session ---
export function getUsers(): User[] { return read(KEYS.users, []) }
export function saveUser(user: User) {
  const users = getUsers()
  const i = users.findIndex(u => u.id === user.id)
  if (i >= 0) users[i] = user; else users.push(user)
  write(KEYS.users, users)
}
export function findUserByPhone(phone: string) {
  return getUsers().find(u => u.phone === phone)
}
export function getSessionUser(): User | null {
  const id = localStorage.getItem(KEYS.session)
  if (!id) return null
  return getUsers().find(u => u.id === id) ?? null
}
export function setSessionUser(id: string | null) {
  if (id) localStorage.setItem(KEYS.session, id)
  else localStorage.removeItem(KEYS.session)
}

// --- Tournaments ---
export function getTournaments(): Tournament[] { return read(KEYS.tournaments, []) }
export function saveTournament(t: Tournament) {
  const list = getTournaments()
  const i = list.findIndex(x => x.id === t.id)
  if (i >= 0) list[i] = t; else list.push(t)
  write(KEYS.tournaments, list)
}

// --- Entry payments (player -> tournament entry fee) ---
export function getEntryPayments(): EntryPayment[] { return read(KEYS.entryPayments, []) }
export function addEntryPayment(p: EntryPayment) {
  write(KEYS.entryPayments, [...getEntryPayments(), p])
}
export function updateEntryPayment(p: EntryPayment) {
  write(KEYS.entryPayments, getEntryPayments().map(x => (x.id === p.id ? p : x)))
}

// --- Hosting requests (organizer -> hosting fee) ---
export function getHostingRequests(): HostingRequest[] { return read(KEYS.hostingRequests, []) }
export function addHostingRequest(r: HostingRequest) {
  write(KEYS.hostingRequests, [...getHostingRequests(), r])
}
export function updateHostingRequest(r: HostingRequest) {
  write(KEYS.hostingRequests, getHostingRequests().map(x => (x.id === r.id ? r : x)))
}

// --- Cashout requests (player wallet -> bKash/Bank) ---
export function getCashouts(): CashoutRequest[] { return read(KEYS.cashouts, []) }
export function addCashout(c: CashoutRequest) {
  write(KEYS.cashouts, [...getCashouts(), c])
}
export function updateCashout(c: CashoutRequest) {
  write(KEYS.cashouts, getCashouts().map(x => (x.id === c.id ? c : x)))
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}
