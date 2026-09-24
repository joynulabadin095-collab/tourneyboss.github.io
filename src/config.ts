import type { PaymentMethod } from './types'

// The personal/agent number players send money TO when depositing. Same
// number the admin sends FROM when paying out an approved withdrawal.
// Replace with the real numbers before going live.
export const ADMIN_PAYMENT_NUMBERS: Record<Exclude<PaymentMethod, 'Bank'>, string> = {
  bKash: '01911753985',
  Nagad: '01911753985',
  Rocket: '01911753985',
}
