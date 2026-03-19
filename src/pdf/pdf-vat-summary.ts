import type PDFDocument from 'pdfkit'
import { formatCHF } from '@/lib/swiss-format'
import type { VatGroup } from '@/lib/vat-calculator'
import {
  A4_WIDTH,
  MARGIN_RIGHT,
  FONT_SIZE_SMALL,
  FONT_SIZE_NORMAL,
  LINE_HEIGHT,
} from './pdf-layout'

/**
 * Render VAT summary breakdown (right-aligned).
 */
export function renderVatSummary(
  doc: InstanceType<typeof PDFDocument>,
  vatGroups: VatGroup[],
  y: number,
): number {
  if (vatGroups.length === 0) return y

  const rightEdge = A4_WIDTH - MARGIN_RIGHT
  // 4 columns right-aligned: Satz | Netto | MWST | Brutto
  const colSatz = rightEdge - 230
  const colNet = rightEdge - 170
  const colVat = rightEdge - 100
  const colGross = rightEdge - 55
  const colWidth = 55

  // Header
  doc
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#777777')

  doc.text('MWST', colSatz, y, { width: 50 })
  doc.text('Netto', colNet, y, { width: colWidth, align: 'right' })
  doc.text('MWST', colVat, y, { width: colWidth, align: 'right' })
  doc.text('Brutto', colGross, y, { width: colWidth, align: 'right' })

  y += LINE_HEIGHT

  // Rows
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_NORMAL)
    .fillColor('#1a1a1a')

  for (const group of vatGroups) {
    doc.text(`${group.rate}%`, colSatz, y, { width: 50 })
    doc.text(formatCHF(group.netAmount), colNet, y, { width: colWidth, align: 'right' })
    doc.text(formatCHF(group.vatAmount), colVat, y, { width: colWidth, align: 'right' })
    doc.text(formatCHF(group.grossAmount), colGross, y, { width: colWidth, align: 'right' })
    y += LINE_HEIGHT
  }

  doc.fillColor('#000000')

  return y + 8
}
