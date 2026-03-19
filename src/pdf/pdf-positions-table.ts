import type PDFDocument from 'pdfkit'
import type { InvoicePosition } from '@/types/invoice'
import { formatCHF } from '@/lib/swiss-format'
import { positionNetAmount } from '@/lib/vat-calculator'
import {
  MARGIN_LEFT,
  A4_WIDTH,
  MARGIN_RIGHT,
  FONT_SIZE_NORMAL,
  FONT_SIZE_SMALL,
  LINE_HEIGHT,
  TABLE_COL_POS,
  TABLE_COL_QTY,
  TABLE_COL_PRICE,
  TABLE_COL_VAT,
  TABLE_COL_AMOUNT,
} from './pdf-layout'

/**
 * Render the positions table
 * Returns the Y position after the table
 */
export function renderPositionsTable(
  doc: InstanceType<typeof PDFDocument>,
  positions: InvoicePosition[],
  y: number,
): number {
  const rightEdge = A4_WIDTH - MARGIN_RIGHT

  // Table header
  doc
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#666666')

  doc.text('Beschreibung', TABLE_COL_POS, y)
  doc.text('Menge', TABLE_COL_QTY, y, { width: 50, align: 'right' })
  doc.text('Einzelpreis', TABLE_COL_PRICE, y, { width: 60, align: 'right' })
  doc.text('MWST', TABLE_COL_VAT, y, { width: 40, align: 'right' })
  doc.text('Betrag', TABLE_COL_AMOUNT - 60, y, { width: 60, align: 'right' })

  y += LINE_HEIGHT

  // Header line
  doc
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(rightEdge, y)
    .stroke()

  y += 6

  // Rows
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_NORMAL)
    .fillColor('#000000')

  for (const pos of positions) {
    const net = positionNetAmount(pos)

    doc.text(pos.description, TABLE_COL_POS, y, {
      width: TABLE_COL_QTY - TABLE_COL_POS - 10,
    })
    doc.text(String(pos.quantity), TABLE_COL_QTY, y, {
      width: 50,
      align: 'right',
    })
    doc.text(formatCHF(pos.unitPrice), TABLE_COL_PRICE, y, {
      width: 60,
      align: 'right',
    })
    doc.text(`${pos.vatRate}%`, TABLE_COL_VAT, y, {
      width: 40,
      align: 'right',
    })
    doc.text(formatCHF(net), TABLE_COL_AMOUNT - 60, y, {
      width: 60,
      align: 'right',
    })

    y += LINE_HEIGHT + 4
  }

  // Bottom line
  doc
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(rightEdge, y)
    .stroke()

  return y + 10
}
