import type { InvoicePosition, VatRate } from '@/types/invoice'

export interface VatGroup {
  rate: VatRate
  netAmount: number
  vatAmount: number
  grossAmount: number
}

/**
 * Calculate net amount for a single position
 */
export function positionNetAmount(pos: InvoicePosition): number {
  return pos.quantity * pos.unitPrice
}

/**
 * Calculate VAT amount for a single position
 */
export function positionVatAmount(pos: InvoicePosition): number {
  return positionNetAmount(pos) * (pos.vatRate / 100)
}

/**
 * Calculate gross amount for a single position
 */
export function positionGrossAmount(pos: InvoicePosition): number {
  return positionNetAmount(pos) + positionVatAmount(pos)
}

/**
 * Group positions by VAT rate and sum amounts
 */
export function calculateVatGroups(positions: InvoicePosition[]): VatGroup[] {
  const groups = new Map<VatRate, VatGroup>()

  for (const pos of positions) {
    const net = positionNetAmount(pos)
    const vat = positionVatAmount(pos)
    const existing = groups.get(pos.vatRate)

    if (existing) {
      existing.netAmount += net
      existing.vatAmount += vat
      existing.grossAmount += net + vat
    } else {
      groups.set(pos.vatRate, {
        rate: pos.vatRate,
        netAmount: net,
        vatAmount: vat,
        grossAmount: net + vat,
      })
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.rate - b.rate)
}

/**
 * Calculate totals across all positions
 */
export function calculateTotals(positions: InvoicePosition[]) {
  const groups = calculateVatGroups(positions)
  const totalNet = groups.reduce((sum, g) => sum + g.netAmount, 0)
  const totalVat = groups.reduce((sum, g) => sum + g.vatAmount, 0)
  const totalGross = groups.reduce((sum, g) => sum + g.grossAmount, 0)

  return { totalNet, totalVat, totalGross, vatGroups: groups }
}
