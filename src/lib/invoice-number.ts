/**
 * Generate invoice number in format: [SHORTCODE]-[YEAR]-[SEQUENCE]
 * e.g. PBR-2026-0001
 */
export function generateInvoiceNumber(
  shortCode: string,
  year: number,
  sequence: number,
): string {
  return `${shortCode}-${year}-${String(sequence).padStart(4, '0')}`
}

/**
 * Parse invoice number to extract components
 */
export function parseInvoiceNumber(invoiceNumber: string): {
  shortCode: string
  year: number
  sequence: number
} | null {
  const match = invoiceNumber.match(/^([A-Z]{2,3})-(\d{4})-(\d{4})$/)
  if (!match) return null
  return {
    shortCode: match[1],
    year: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  }
}
