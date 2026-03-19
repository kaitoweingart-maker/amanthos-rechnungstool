import type PDFDocument from 'pdfkit'
import type { Company, Brand } from '@/types/company'
import { formatIBAN } from '@/lib/swiss-format'
import {
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_TOP,
  A4_WIDTH,
  FONT_SIZE_SMALL,
  FONT_SIZE_LABEL,
  LINE_HEIGHT_SMALL,
} from './pdf-layout'

const LOGO_MAX_WIDTH = 140
const LOGO_MAX_HEIGHT = 50

/**
 * Render company letterhead (top of page) with optional logo
 * Returns the Y position after the header
 */
export function renderHeader(
  doc: InstanceType<typeof PDFDocument>,
  company: Company,
  brand: Brand,
  logoBuffer?: Buffer | null,
): number {
  let y = MARGIN_TOP
  const rightEdge = A4_WIDTH - MARGIN_RIGHT

  // Render logo on the right if available
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, rightEdge - LOGO_MAX_WIDTH, y, {
        fit: [LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT],
        align: 'right',
      })
    } catch (err) {
      console.warn('Logo rendering failed:', err)
    }
  }

  // Company name (bold, left)
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .text(company.name, MARGIN_LEFT, y)

  y += 16

  // Brand name below company name (if different)
  if (brand.label !== company.name) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#444444')
      .text(brand.label, MARGIN_LEFT, y)
      .fillColor('#000000')
    y += 14
  }

  // Company address and details
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#666666')

  const lines = [
    `${company.address.street}, ${company.address.zip} ${company.address.city}`,
    `UID: ${company.uid}`,
    `IBAN: ${formatIBAN(brand.iban)} · BIC: ${company.bic}`,
  ]

  for (const line of lines) {
    doc.text(line, MARGIN_LEFT, y)
    y += LINE_HEIGHT_SMALL
  }

  doc.fillColor('#000000')

  // Make sure y is below the logo area
  const logoBottomY = MARGIN_TOP + LOGO_MAX_HEIGHT + 8
  if (y < logoBottomY) y = logoBottomY

  // Horizontal line
  y += 4
  doc
    .strokeColor('#cccccc')
    .lineWidth(0.5)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(rightEdge, y)
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
