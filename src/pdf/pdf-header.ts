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

const LOGO_MAX_WIDTH = 130
const LOGO_MAX_HEIGHT = 45

/**
 * Render company letterhead with logo top-right, company info top-left.
 */
export function renderHeader(
  doc: InstanceType<typeof PDFDocument>,
  company: Company,
  brand: Brand,
  logoBuffer?: Buffer | null,
): number {
  let y = MARGIN_TOP
  const rightEdge = A4_WIDTH - MARGIN_RIGHT

  // Logo on the right
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

  // Company name
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#1a1a1a')
    .text(company.name, MARGIN_LEFT, y)

  y += 14

  // Brand name (if different from company)
  if (brand.label !== company.name) {
    doc
      .font('Helvetica')
      .fontSize(FONT_SIZE_SMALL)
      .fillColor('#555555')
      .text(brand.label, MARGIN_LEFT, y)
    y += 11
  }

  // Address + UID + IBAN
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_SMALL)
    .fillColor('#777777')

  doc.text(`${company.address.street}, ${company.address.zip} ${company.address.city}`, MARGIN_LEFT, y)
  y += LINE_HEIGHT_SMALL
  doc.text(`UID: ${company.uid}`, MARGIN_LEFT, y)
  y += LINE_HEIGHT_SMALL
  doc.text(`IBAN: ${formatIBAN(brand.iban)}`, MARGIN_LEFT, y)
  y += LINE_HEIGHT_SMALL

  doc.fillColor('#000000')

  // Ensure we're below logo
  const logoBottom = MARGIN_TOP + LOGO_MAX_HEIGHT + 5
  if (y < logoBottom) y = logoBottom

  // Thin separator
  y += 6
  doc
    .strokeColor('#d0d0d0')
    .lineWidth(0.4)
    .moveTo(MARGIN_LEFT, y)
    .lineTo(rightEdge, y)
    .stroke()
    .strokeColor('#000000')

  return y + 18
}

/**
 * Render small sender line above debtor address block.
 */
export function renderSenderLine(
  doc: InstanceType<typeof PDFDocument>,
  company: Company,
  y: number,
): number {
  doc
    .font('Helvetica')
    .fontSize(FONT_SIZE_LABEL)
    .fillColor('#aaaaaa')
    .text(
      `${company.name} · ${company.address.street} · ${company.address.zip} ${company.address.city}`,
      MARGIN_LEFT,
      y,
    )
    .fillColor('#000000')

  return y + 12
}
