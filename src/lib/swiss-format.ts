/**
 * Format a number in Swiss style: 1'250.00
 */
export function formatCHF(amount: number): string {
  const fixed = amount.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "'")
  return `${formatted}.${decPart}`
}

/**
 * Format IBAN with spaces for display: CH98 0024 8248 1989 3101 V
 */
export function formatIBAN(iban: string): string {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}
