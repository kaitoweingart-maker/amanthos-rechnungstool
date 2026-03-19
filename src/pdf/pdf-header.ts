import type PDFDocument from 'pdfkit'
import type { Company, Brand } from '@/types/company'
import { formatIBAN } from '@/lib/swiss-format'
import {
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_TOP,
  A4_WIDTH,
  FONT_SIZE_NORMAL,
  FONT_SIZE_SMALL,
  FONT_SIZE_LABEL,
  LINE_HEIGHT_SMALL,
} from './pdf-layout'

/**
 * Render company letterhead (top of page)
 * Returns the Y position after the header
 */
export function renderHeader(
  doc: InstanceType<typeof PDFDocument>,
  company: Company,
  brand: Brand,
): number {
  let y = MARGIN_TOP

  // Company name (bold, left)
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(company.name, MARGIN_LEFT, y)

  // Brand name on the right
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_NORMAL)
    .text(brand.label, MARGIN_LEFT, y, {
      width: A4_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
      align: 'right',
    })

  y += 20

  // Company address and details
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#666666')

  const lines = [
    `${company.address.street}, ${company.address.zip} ${company.address.city}`,
    `UID: ${company.uid} · IBAN: ${formatIBAN(brand.iban)}`,
  ]

  for (const line of lines) {
    doc.text(line, MARGIN_LEFT, y)
    y += LINE_HEIGHT_SMALL
  }

  doc.fillColor('#000000')

  // Horizontal line
  y += 8
  doc
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(A4_WIDTH - MARGIN_RIGHT, y)
    .stroke()
    .strokeColor('#000000')

  return y + 15
}

/**
 * Render sender line above debtor address (small, single line)
 */
export function renderSenderLine(
  doc: InstanceType<typeof PDFDocument>,
  company: Company,
  y: number,
): number {
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_LABEL)
    .fillColor('#999999')
    .text(
      `${company.name} · ${company.address.street} · ${company.address.zip} ${company.address.city}`,
      MARGIN_LEFT,
      y,
    )
    .fillColor('#000000')

  return y + 14
}
