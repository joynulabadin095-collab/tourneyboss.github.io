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
}

export interface HostingRequest {
  id: string
  organizerId: string
  organizerName: string
  tournamentId: string
  tournamentTitle: string
  hostingFee: number
  method: PaymentMethod
  transactionRef: string
  status: PaymentStatus
  createdAt: string
}

export type TournamentStatus = 'draft' | 'open' | 'ongoing' | 'completed'

export interface Tournament {
  id: string
  title: string
  game: string
  organizerId: string
  organizerName: string
  entryFee: number
  prizePool: number
  maxSlots: number
  filledSlots: number
  startsAt: string
  status: TournamentStatus
  hostingApproved: boolean
  rules: string
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
