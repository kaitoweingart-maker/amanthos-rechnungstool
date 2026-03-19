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
 * Render VAT summary breakdown
 * Returns the Y position after the summary
 */
export function renderVatSummary(
  doc: InstanceType<typeof PDFDocument>,
  vatGroups: VatGroup[],
  y: number,
): number {
  if (vatGroups.length === 0) return y

  const colLabel = 320
  const colNet = 390
  const colVat = 460
  const colGross = A4_WIDTH - MARGIN_RIGHT - 60

  doc
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#666666')

  doc.text('MWST-Satz', colLabel, y)
  doc.text('Netto', colNet, y, { width: 60, align: 'right' })
  doc.text('MWST', colVat, y, { width: 60, align: 'right' })
  doc.text('Brutto', colGross, y, { width: 60, align: 'right' })

  y += LINE_HEIGHT

  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_NORMAL)
    .fillColor('#000000')

  for (const group of vatGroups) {
    doc.text(`${group.rate}%`, colLabel, y)
    doc.text(formatCHF(group.netAmount), colNet, y, { width: 60, align: 'right' })
    doc.text(formatCHF(group.vatAmount), colVat, y, { width: 60, align: 'right' })
    doc.text(formatCHF(group.grossAmount), colGross, y, { width: 60, align: 'right' })
    y += LINE_HEIGHT
  }

  return y + 10
}
