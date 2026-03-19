import type PDFDocument from 'pdfkit'
import { formatCHF } from '@/lib/swiss-format'
import {
  A4_WIDTH,
  MARGIN_RIGHT,
  FONT_SIZE_NORMAL,
  LINE_HEIGHT,
} from './pdf-layout'

/**
 * Render totals (net, VAT, gross) right-aligned.
 */
export function renderTotals(
  doc: InstanceType<typeof PDFDocument>,
  totalNet: number,
  totalVat: number,
  totalGross: number,
  y: number,
  isPaid?: boolean,
): number {
  const rightEdge = A4_WIDTH - MARGIN_RIGHT
  const labelX = rightEdge - 170
  const valueX = rightEdge - 55
  const valueWidth = 55

  // Net
  doc.font('Helvetica').fontSize(FONT_SIZE_NORMAL).fillColor('#555555')
  doc.text('Netto CHF', labelX, y, { width: 100 })
  doc.text(formatCHF(totalNet), valueX, y, { width: valueWidth, align: 'right' })
  y += LINE_HEIGHT

  // VAT
  doc.text('MWST CHF', labelX, y, { width: 100 })
  doc.text(formatCHF(totalVat), valueX, y, { width: valueWidth, align: 'right' })
  y += LINE_HEIGHT + 2

  // Separator line
  doc
    .strokeColor('#1a1a1a')
    .lineWidth(0.8)
    .moveTo(labelX, y)
    .lineTo(rightEdge, y)
    .stroke()
  y += 6

  // Total
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#1a1a1a')
  doc.text('Total CHF', labelX, y, { width: 100 })
  doc.text(formatCHF(totalGross), valueX, y, { width: valueWidth, align: 'right' })

  y += 20

  // Payment status
  if (isPaid) {
    doc
      .font('Helvetica-Bold')
      .fontSize(FONT_SIZE_NORMAL)
      .fillColor('#16a34a')
      .text('BEZAHLT', labelX, y, { width: rightEdge - labelX, align: 'right' })
      .fillColor('#000000')
    y += LINE_HEIGHT
  }

  doc.fillColor('#000000')

  return y + 10
}
