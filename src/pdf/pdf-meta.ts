import type PDFDocument from 'pdfkit'
import { formatDateCH, calculateDueDate } from '@/lib/date-utils'
import type { PaymentTermDays } from '@/types/invoice'
import {
  MARGIN_LEFT,
  FONT_SIZE_TITLE,
  FONT_SIZE_NORMAL,
  LINE_HEIGHT,
} from './pdf-layout'

/**
 * Render invoice title and meta info (number, date, due date)
 * Returns the Y position after the meta block
 */
export function renderMeta(
  doc: InstanceType<typeof PDFDocument>,
  invoiceNumber: string,
  invoiceDate: string,
  paymentTermDays: PaymentTermDays,
  y: number,
): number {
  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZE_TITLE)
    .text('Rechnung', MARGIN_LEFT, y)

  y += 24

  const dueDate = calculateDueDate(invoiceDate, paymentTermDays)

  // Meta info in two columns
  const labelX = MARGIN_LEFT
  const valueX = MARGIN_LEFT + 110

  doc.font('Helvetica').fontSize(FONT_SIZE_NORMAL)

  const meta = [
    ['Rechnungsnummer:', invoiceNumber],
    ['Rechnungsdatum:', formatDateCH(invoiceDate)],
    ['Zahlbar bis:', formatDateCH(dueDate)],
    ['Zahlungsfrist:', `${paymentTermDays} Tage netto`],
  ]

  for (const [label, value] of meta) {
    doc
      .font('Helvetica')
      .fillColor('#666666')
      .text(label, labelX, y)
      .fillColor('#000000')
      .text(value, valueX, y)
    y += LINE_HEIGHT
  }

  return y + 20
}
