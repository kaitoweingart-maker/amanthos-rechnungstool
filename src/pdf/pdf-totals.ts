import type PDFDocument from 'pdfkit'
import { formatCHF } from '@/lib/swiss-format'
import {
  A4_WIDTH,
  MARGIN_RIGHT,
  FONT_SIZE_NORMAL,
  LINE_HEIGHT,
} from './pdf-layout'

/**
 * Render totals (net, VAT, gross)
 * Returns the Y position after the totals
 */
export function renderTotals(
  doc: InstanceType<typeof PDFDocument>,
  totalNet: number,
  totalVat: number,
  totalGross: number,
  y: number,
): number {
  const labelX = 360
  const valueX = A4_WIDTH - MARGIN_RIGHT - 60

  // Net
  doc.font('Helvetica').fontSize(FONT_SIZE_NORMAL)
  doc.text('Netto CHF', labelX, y)
  doc.text(formatCHF(totalNet), valueX, y, { width: 60, align: 'right' })
  y += LINE_HEIGHT

  // VAT
  doc.text('MWST CHF', labelX, y)
  doc.text(formatCHF(totalVat), valueX, y, { width: 60, align: 'right' })
  y += LINE_HEIGHT

  // Separator
  doc
    .strokeColor('#000000')
    .lineWidth(1)
    .moveTo(labelX, y)
    .lineTo(A4_WIDTH - MARGIN_RIGHT, y)
    .stroke()
  y += 6

  // Total
  doc.font('Helvetica-Bold').fontSize(12)
  doc.text('Total CHF', labelX, y)
  doc.text(formatCHF(totalGross), valueX, y, { width: 60, align: 'right' })

  return y + 30
}
