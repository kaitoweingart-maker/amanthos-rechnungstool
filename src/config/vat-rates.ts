import type { VatRate } from '@/types/invoice'

export const VAT_RATES: { value: VatRate; label: string }[] = [
  { value: 3.8, label: '3.8% (Beherbergung)' },
  { value: 8.1, label: '8.1% (Normal)' },
]

export const DEFAULT_VAT_RATE: VatRate = 8.1

/**
 * Get default VAT rate based on company.
 * Hotel AG & Living AG → 3.8% (Beherbergung)
 * Amanthos AG → 8.1% (Normal)
 */
export function getDefaultVatRate(companyId: string): VatRate {
  if (companyId === 'amanthos-hotel' || companyId === 'amanthos-living') {
    return 3.8
  }
  return 8.1
}
