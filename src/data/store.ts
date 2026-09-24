import { get, post, patch } from './api'
import type {
  User, Tournament, EntryPayment, HostingRequest, CashoutRequest, Deposit, Role, PaymentMethod,
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

// Update the current user's profile (name + phone).
export function updateMyProfile(data: { name: string; phone: string }) {
  return patch<{ user: User }>('/auth/me', data).then(r => r.user)
}

// --- Tournaments (read-only — owned by the Android app) ---
export function getTournaments() {
  return get<{ tournaments: Tournament[] }>('/tournaments').then(r => r.tournaments)
}

export function getTournament(id: string) {
  return get<{ tournament: Tournament }>(`/tournaments/${id}`).then(r => r.tournament)
}

// --- Entry payments (player -> tournament entry fee) ---
export function submitEntryPayment(data: { tournamentId: string; amount: number; method: PaymentMethod; transactionRef: string }) {
  return post<{ payment: EntryPayment }>('/entry-payments', data).then(r => r.payment)
}

// Pay a fixed-fee (website-created) tournament's entry fee straight from
// wallet balance — approved instantly, no bKash reference needed.
export function payEntryFromWallet(tournamentId: string) {
  return post<{ payment: EntryPayment }>('/entry-payments/wallet', { tournamentId }).then(r => r.payment)
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

// --- Deposits (player -> wallet top-up) ---
export function submitDeposit(data: { amount: number; method: PaymentMethod; transactionRef: string }) {
  return post<{ deposit: Deposit }>('/deposits', data).then(r => r.deposit)
}

export function getMyDeposits() {
  return get<{ deposits: Deposit[] }>('/deposits/mine').then(r => r.deposits)
}

export function getPendingDeposits() {
  return get<{ deposits: Deposit[] }>('/deposits?status=pending').then(r => r.deposits)
}

export function approveDeposit(id: string) {
  return post<{ ok: true }>(`/deposits/${id}/approve`)
}

export function rejectDeposit(id: string) {
  return post<{ ok: true }>(`/deposits/${id}/reject`)
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


