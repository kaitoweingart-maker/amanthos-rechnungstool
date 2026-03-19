import type PDFDocument from 'pdfkit'
import type { DebtorAddress } from '@/types/invoice'
import { MARGIN_LEFT, FONT_SIZE_NORMAL, LINE_HEIGHT } from './pdf-layout'

/**
 * Render debtor address block.
 */
export function renderDebtor(
  doc: InstanceType<typeof PDFDocument>,
  debtor: DebtorAddress,
  y: number,
): number {
  doc.font('Helvetica').fontSize(FONT_SIZE_NORMAL).fillColor('#1a1a1a')

  const lines = [
    debtor.name,
    debtor.street,
    `${debtor.zip} ${debtor.city}`,
  ]

  if (debtor.country && debtor.country !== 'CH' && debtor.country !== 'Schweiz') {
    lines.push(debtor.country)
  }

  for (const line of lines) {
    doc.text(line, MARGIN_LEFT, y)
    y += LINE_HEIGHT
  }

  return y + 25
}
