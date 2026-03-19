import type { PaymentTermDays } from '@/types/invoice'

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Calculate due date from invoice date + payment term days
 */
export function calculateDueDate(invoiceDate: string, days: PaymentTermDays): string {
  const date = new Date(invoiceDate)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

/**
 * Format ISO date to Swiss format: 19.03.2026
 */
export function formatDateCH(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${d}.${m}.${y}`
}
