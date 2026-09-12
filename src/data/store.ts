import { get, post } from './api'
import type {
  User, Tournament, EntryPayment, HostingRequest, CashoutRequest, Role, PaymentMethod,
} from '../types'

// --- Auth ---
// Called right after Firebase Auth's Google popup succeeds, with the Firebase
// ID token. Creates the users/{uid} doc on first sign-in (role only applies
// then); an existing doc (from this site or the Android app) is returned as-is.
export function googleSignIn(idToken: string, role?: Role) {
  return post<{ user: User }>('/auth/google', { idToken, role })
}

export function fetchMe() {
  return get<{ user: User }>('/auth/me')
}

// --- Tournaments ---
export function getTournaments() {
  return get<{ tournaments: Tournament[] }>('/tournaments').then(r => r.tournaments)
}

export function getTournament(id: string) {
  return get<{ tournament: Tournament }>(`/tournaments/${id}`).then(r => r.tournament)
}

export function createTournament(data: {
  title: string; game: string; entryFee: number; prizePool: number
  maxSlots: number; startsAt: string; rules: string
}) {
  return post<{ tournament: Tournament }>('/tournaments', data).then(r => r.tournament)
}

// --- Entry payments (player -> tournament entry fee) ---
export function submitEntryPayment(data: { tournamentId: string; method: PaymentMethod; transactionRef: string }) {
  return post<{ payment: EntryPayment }>('/entry-payments', data).then(r => r.payment)
}

export function getMyEntryPayments() {
  return get<{ payments: EntryPayment[] }>('/entry-payments/mine').then(r => r.payments)
}

export function getPendingEntryPayments() {
  return get<{ payments: EntryPayment[] }>('/entry-payments?status=pending').then(r => r.payments)
}

export function approveEntryPayment(id: string) {
  return post<{ ok: true }>(`/entry-payments/${id}/approve`)
}

export function rejectEntryPayment(id: string) {
  return post<{ ok: true }>(`/entry-payments/${id}/reject`)
}

// --- Hosting requests (organizer -> hosting fee) ---
export function submitHostingRequest(data: { tournamentId: string; method: PaymentMethod; transactionRef: string }) {
  return post<{ request: HostingRequest }>('/hosting-requests', data).then(r => r.request)
}

export function getMyHostingRequests() {
  return get<{ requests: HostingRequest[] }>('/hosting-requests/mine').then(r => r.requests)
}

export function getPendingHostingRequests() {
  return get<{ requests: HostingRequest[] }>('/hosting-requests?status=pending').then(r => r.requests)
}

export function approveHostingRequest(id: string) {
  return post<{ ok: true }>(`/hosting-requests/${id}/approve`)
}

export function rejectHostingRequest(id: string) {
  return post<{ ok: true }>(`/hosting-requests/${id}/reject`)
}

// --- Cashout requests (player wallet -> bKash/Bank) ---
export function submitCashout(data: { amount: number; method: PaymentMethod; accountNumber: string }) {
  return post<{ cashout: CashoutRequest }>('/cashouts', data).then(r => r.cashout)
}

export function getMyCashouts() {
  return get<{ cashouts: CashoutRequest[] }>('/cashouts/mine').then(r => r.cashouts)
}

export function getPendingCashouts() {
  return get<{ cashouts: CashoutRequest[] }>('/cashouts?status=pending').then(r => r.cashouts)
}

export function approveCashout(id: string) {
  return post<{ ok: true }>(`/cashouts/${id}/approve`)
}

export function rejectCashout(id: string) {
  return post<{ ok: true }>(`/cashouts/${id}/reject`)
}

