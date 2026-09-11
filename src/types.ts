export type Role = 'player' | 'organizer' | 'admin'

export interface User {
  id: string
  name: string
  phone: string
  role: Role
  walletBalance: number // Diamonds/Taka credited from prizes
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export interface EntryPayment {
  id: string
  tournamentId: string
  playerId: string
  playerName: string
  amount: number
  method: 'bKash' | 'Bank'
  transactionRef: string
  status: PaymentStatus
  createdAt: string
}

export interface HostingRequest {
  id: string
  organizerId: string
  organizerName: string
  tournamentTitle: string
  hostingFee: number
  method: 'bKash' | 'Bank'
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
  method: 'bKash' | 'Bank'
  accountNumber: string
  status: PaymentStatus
  createdAt: string
}
