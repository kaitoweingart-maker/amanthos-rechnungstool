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
 * Render invoice title and meta info.
 */
export function renderMeta(
  doc: InstanceType<typeof PDFDocument>,
  invoiceNumber: string,
  invoiceDate: string,
  paymentTermDays: PaymentTermDays,
  y: number,
  isPaid?: boolean,
  paymentInfo?: { method: string; date: string },
): number {
  // Title
  doc
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZE_TITLE)
    .fillColor('#1a1a1a')
    .text('Rechnung', MARGIN_LEFT, y)

  y += 22

  const dueDate = calculateDueDate(invoiceDate, paymentTermDays)
  const labelX = MARGIN_LEFT
  const valueX = MARGIN_LEFT + 120

  doc.font('Helvetica').fontSize(FONT_SIZE_NORMAL)

  const meta: [string, string][] = [
    ['Rechnungsnummer:', invoiceNumber],
    ['Rechnungsdatum:', formatDateCH(invoiceDate)],
    ['Zahlbar bis:', formatDateCH(dueDate)],
    ['Zahlungsfrist:', `${paymentTermDays} Tage netto`],
  ]

  if (isPaid && paymentInfo) {
    meta.push(
      ['Zahlungsstatus:', 'Bezahlt'],
      ['Zahlungsart:', paymentInfo.method],
      ['Bezahlt am:', formatDateCH(paymentInfo.date)],
    )
  }

  for (const [label, value] of meta) {
    doc
      .font('Helvetica')
      .fillColor('#777777')
      .text(label, labelX, y)
    doc
      .fillColor('#1a1a1a')
      .text(value, valueX, y)
    y += LINE_HEIGHT
  }

  doc.fillColor('#000000')

  return y + 16
}
