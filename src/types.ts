export type Role = 'member' | 'organizer' | 'admin' | 'sponsor_manager'

export interface User {
  uid: string
  name: string
  phone: string
  role: Role
  photoUrl: string | null
  walletBalance: number // Diamonds/Taka credited from prizes
  // Written by the Android app (Firestore users/{uid} doc has many more fields
  // than this website reads/writes — these are the ones Profile.tsx displays).
  // Optional because older accounts or website-only signups may not have them.
  username?: string
  whatsapp?: string
  mlbbUid?: string
  ffUid?: string
  pubgUid?: string
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Wallet'

// Same 2% used by the backend — kept here only for showing a live fee
// preview in the deposit/withdraw forms before submitting.
export const PLATFORM_FEE_RATE = 0.02

export interface Deposit {
  id: string
  playerId: string
  playerName: string
  amount: number
  method: PaymentMethod
  transactionRef: string
  status: PaymentStatus
  createdAt: string
  creditedAmount: number | null
}

export interface EntryPayment {
  id: string
  tournamentId: string
  playerId: string
  playerName: string
  amount: number
  method: PaymentMethod
  transactionRef: string
  status: PaymentStatus
  createdAt: string
  verificationToken: string | null
  used: boolean
}

export interface HostingRequest {
  id: string
  organizerId: string
  organizerName: string
  tournamentId: string
  tournamentName: string
  hostingFee: number
  method: PaymentMethod
  transactionRef: string
  status: PaymentStatus
  createdAt: string
}

// Read-only — mirrors the Android app's Tournament doc. The website never
// creates, edits, or deletes tournaments; it only displays them and
// collects entry-fee / hosting-fee payments that reference their id.
export interface Tournament {
  id: string
  name: string
  game: string
  gameMode: string
  teamCount: number
  registeredTeams: number
  status: string // 'draft' | 'registration' | 'in_progress' | 'completed' | 'archived'
  organizerId: string
  organizerDeadline: string
  description: string
  rules: string
  prizeDescription: string | null
  championPrize: string | null
  runnerUpPrize: string | null
  bannerImageUrl: string
  isPublished: boolean
  // Paid tournaments are created from the website (fixed entry fee, same for
  // every entrant, payable straight from wallet balance); free tournaments
  // are created from the app and have neither field set.
  isPaid?: boolean
  entryFee?: number
  // ISO datetime — when registration/slot-filling closes. Optional; when
  // absent, no countdown is shown. Set by the organizer at request time.
  registrationDeadline?: string
}

export interface CashoutRequest {
  id: string
  playerId: string
  playerName: string
  amount: number
  receivableAmount: number
  method: PaymentMethod
  accountNumber: string
  status: PaymentStatus
  createdAt: string
}

// A member asks to host a PAID tournament from the website (mirrors the
// app's own free-tournament organizer-request flow, but for paid ones).
export interface OrganizerRequest {
  id: string
  userId: string
  userName: string
  tournamentName: string
  game: string
  gameMode: string
  teamCount: number
  entryFee: number
  registrationDeadline: string | null
  description: string
  rules: string
  prizeDescription: string | null
  championPrize: string | null
  runnerUpPrize: string | null
  status: PaymentStatus
  createdAt: string
  tournamentId: string | null
}

// Single global doc the app reads at runtime instead of hardcoding a domain.
export interface WebsiteConfig {
  baseUrl: string
}
