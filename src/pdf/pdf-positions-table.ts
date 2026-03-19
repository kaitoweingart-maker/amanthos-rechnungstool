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
} from './pdf-layout'

// Column positions
const COL_DESC = MARGIN_LEFT
const COL_QTY = 310
const COL_PRICE = 370
const COL_VAT = 430
const COL_AMOUNT = A4_WIDTH - MARGIN_RIGHT

/**
 * Render the positions table.
 */
export function renderPositionsTable(
  doc: InstanceType<typeof PDFDocument>,
  positions: InvoicePosition[],
  y: number,
): number {
  const rightEdge = A4_WIDTH - MARGIN_RIGHT

  // Table header background
  doc
    .rect(MARGIN_LEFT - 4, y - 3, rightEdge - MARGIN_LEFT + 8, LINE_HEIGHT + 4)
    .fill('#f5f5f5')

  // Table header text
  doc
    .font('Helvetica-Bold')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#555555')

  doc.text('Beschreibung', COL_DESC, y)
  doc.text('Menge', COL_QTY, y, { width: 50, align: 'right' })
  doc.text('Preis', COL_PRICE, y, { width: 50, align: 'right' })
  doc.text('MWST', COL_VAT, y, { width: 35, align: 'right' })
  doc.text('Betrag', COL_AMOUNT - 55, y, { width: 55, align: 'right' })

  y += LINE_HEIGHT + 4

  // Rows
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_NORMAL)
    .fillColor('#1a1a1a')

  for (const pos of positions) {
    const net = positionNetAmount(pos)

    doc.text(pos.description, COL_DESC, y, {
      width: COL_QTY - COL_DESC - 10,
    })
    doc.text(String(pos.quantity), COL_QTY, y, {
      width: 50,
      align: 'right',
    })
    doc.text(formatCHF(pos.unitPrice), COL_PRICE, y, {
      width: 50,
      align: 'right',
    })
    doc.text(`${pos.vatRate}%`, COL_VAT, y, {
      width: 35,
      align: 'right',
    })
    doc.text(formatCHF(net), COL_AMOUNT - 55, y, {
      width: 55,
      align: 'right',
    })

    y += LINE_HEIGHT + 3
  }

  // Bottom line
  doc
    .strokeColor('#d0d0d0')
    .lineWidth(0.4)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(rightEdge, y)
    .stroke()
    .strokeColor('#000000')

  return y + 8
}
