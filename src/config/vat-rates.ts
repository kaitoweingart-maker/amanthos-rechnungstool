import type { VatRate } from '@/types/invoice'

export const VAT_RATES: { value: VatRate; label: string }[] = [
  { value: 3.8, label: '3.8% (reduziert)' },
  { value: 8.1, label: '8.1% (normal)' },
]

export const DEFAULT_VAT_RATE: VatRate = 8.1
