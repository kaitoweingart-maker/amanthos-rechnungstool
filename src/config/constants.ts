import type { PaymentTermDays } from '@/types/invoice'

export const PAYMENT_TERM_OPTIONS: { value: PaymentTermDays; label: string }[] = [
  { value: 7, label: '7 Tage' },
  { value: 14, label: '14 Tage' },
  { value: 30, label: '30 Tage' },
]

export const DEFAULT_PAYMENT_TERM: PaymentTermDays = 30

export const CURRENCY = 'CHF'
