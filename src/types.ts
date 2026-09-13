export type Role = 'member' | 'organizer' | 'admin' | 'sponsor_manager'

export interface User {
  uid: string
  name: string
  phone: string
  role: Role
  photoUrl: string | null
  walletBalance: number // Diamonds/Taka credited from prizes
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected'
export type PaymentMethod = 'bKash' | 'Bank'

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
}

export interface CashoutRequest {
  id: string
  playerId: string
  playerName: string
  amount: number
  method: PaymentMethod
  accountNumber: string
  status: PaymentStatus
  createdAt: string
}
