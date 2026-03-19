import PDFDocument from 'pdfkit'
import blobStream from 'blob-stream'
import { SwissQRBill } from 'swissqrbill/pdf'
import type { InvoiceData } from '@/types/invoice'
import { getBrandById, getCompanyForBrand } from '@/config/companies'
import { calculateTotals } from '@/lib/vat-calculator'
import { formatCHF, formatIBAN } from '@/lib/swiss-format'
import { formatDateCH, calculateDueDate } from '@/lib/date-utils'
import { positionNetAmount } from '@/lib/vat-calculator'
import { buildQrBillData } from './qr-bill-data'

// Layout constants
const ML = 56        // margin left
const MR = 56        // margin right
const PW = 595.28    // page width (A4)
const CW = PW - ML - MR  // content width
const RE = PW - MR  // right edge

/**
 * Fetch a logo as Buffer for PDFKit.
 */
async function fetchLogo(path: string): Promise<Buffer | null> {
  try {
    const r = await fetch(path)
    if (!r.ok) return null
    return Buffer.from(await r.arrayBuffer())
  } catch {
    return null
  }
}

/**
 * Generate a professional PDF invoice and return a blob URL.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<string> {
  const brand = getBrandById(data.brandId)
  const company = getCompanyForBrand(data.brandId)
  if (!brand || !company) throw new Error('Brand/Company not found')

  const { totalGross, vatGroups } = calculateTotals(data.positions)
  const dueDate = calculateDueDate(data.invoiceDate, data.paymentTermDays)
  const logo = brand.logo ? await fetchLogo(brand.logo) : null

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: ML, right: MR },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: `Rechnung ${data.invoiceNumber}`,
      Author: company.name,
    },
  })

  const stream = doc.pipe(blobStream())

  let y = 40

  // ─── LOGO (right-aligned) ───
  if (logo) {
    try {
      doc.image(logo, RE - 140, y, { fit: [140, 50], align: 'right' })
    } catch { /* skip */ }
  }

  // ─── COMPANY INFO (right side, below logo) ───
  y = logo ? 100 : 50
  doc.font('Helvetica').fontSize(9).fillColor('#333333')
  const compLines = [
    company.name,
    company.address.street,
    `${company.address.zip} ${company.address.city}`,
  ]
  for (const line of compLines) {
    doc.text(line, ML + CW / 2, y, { width: CW / 2, align: 'right' })
    y += 12
  }

  // ─── DEBTOR ADDRESS (left side) ───
  const debtorY = logo ? 110 : 60
  doc.font('Helvetica').fontSize(6.5).fillColor('#aaaaaa')
  doc.text(
    `${company.name} · ${company.address.street} · ${company.address.zip} ${company.address.city}`,
    ML, debtorY,
  )

  let dy = debtorY + 14
  doc.font('Helvetica').fontSize(9.5).fillColor('#1a1a1a')
  const debtorLines = [data.debtor.name, data.debtor.street, `${data.debtor.zip} ${data.debtor.city}`]
  if (data.debtor.country && data.debtor.country !== 'CH' && data.debtor.country !== 'Schweiz') {
    debtorLines.push(data.debtor.country)
  }
  for (const line of debtorLines) {
    doc.text(line, ML, dy)
    dy += 14
  }

  // ─── REFERENCE + CONTACT (right side, same height as debtor) ───
  let ry = debtorY + 14
  doc.font('Helvetica').fontSize(8).fillColor('#777777')
  const refLines = [
    `UID: ${company.uid}`,
    `IBAN: ${formatIBAN(brand.iban)}`,
  ]
  for (const line of refLines) {
    doc.text(line, ML + CW / 2, ry, { width: CW / 2, align: 'right' })
    ry += 11
  }

  // ─── DATE (right-aligned) ───
  y = Math.max(dy, ry) + 20
  doc.font('Helvetica').fontSize(9).fillColor('#555555')
  doc.text(`Datum: ${formatDateCH(data.invoiceDate)}`, ML + CW / 2, y, { width: CW / 2, align: 'right' })

  // ─── TITLE ───
  y += 30
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#1a1a1a')
  doc.text(`Rechnung ${data.invoiceNumber}`, ML, y)

  // ─── META INFO ───
  y += 28
  doc.font('Helvetica').fontSize(8.5).fillColor('#555555')
  const metaItems: [string, string][] = [
    ['Zahlbar bis:', formatDateCH(dueDate)],
    ['Zahlungsfrist:', `${data.paymentTermDays} Tage netto`],
  ]
  if (data.isPaid && data.paymentInfo) {
    metaItems.push(
      ['Zahlungsstatus:', 'Bezahlt'],
      ['Zahlungsart:', data.paymentInfo.method],
      ['Bezahlt am:', formatDateCH(data.paymentInfo.date)],
    )
  }
  for (const [label, value] of metaItems) {
    doc.fillColor('#999999').text(label, ML, y, { continued: true, width: 100 })
    doc.fillColor('#333333').text(`  ${value}`, { width: 200 })
    y += 13
  }

  // ─── POSITIONS TABLE ───
  y += 14

  // Header line
  doc.strokeColor('#1a1a1a').lineWidth(0.6).moveTo(ML, y).lineTo(RE, y).stroke()
  y += 6

  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#555555')
  doc.text('Pos.', ML, y, { width: 28 })
  doc.text('Bezeichnung', ML + 30, y, { width: 220 })
  doc.text('Menge', 330, y, { width: 45, align: 'right' })
  doc.text('Einzelpreis', 385, y, { width: 60, align: 'right' })
  doc.text('MWST', 450, y, { width: 35, align: 'right' })
  doc.text('Gesamtpreis', RE - 65, y, { width: 65, align: 'right' })

  y += 13
  doc.strokeColor('#cccccc').lineWidth(0.3).moveTo(ML, y).lineTo(RE, y).stroke()
  y += 8

  // Rows
  doc.font('Helvetica').fontSize(9).fillColor('#1a1a1a')
  data.positions.forEach((pos, i) => {
    const net = positionNetAmount(pos)
    doc.text(`${i + 1}`, ML, y, { width: 28 })
    doc.text(pos.description, ML + 30, y, { width: 220 })
    doc.text(String(pos.quantity), 330, y, { width: 45, align: 'right' })
    doc.text(`${formatCHF(pos.unitPrice)} CHF`, 385, y, { width: 60, align: 'right' })
    doc.text(`${pos.vatRate}%`, 450, y, { width: 35, align: 'right' })
    doc.text(`${formatCHF(net)} CHF`, RE - 65, y, { width: 65, align: 'right' })
    y += 16
  })

  // Bottom line
  y += 2
  doc.strokeColor('#1a1a1a').lineWidth(0.6).moveTo(ML, y).lineTo(RE, y).stroke()
  y += 4
  doc.strokeColor('#1a1a1a').lineWidth(0.3).moveTo(ML, y).lineTo(RE, y).stroke()

  // ─── TOTALS ───
  y += 14
  const labelX = RE - 200
  const valX = RE - 75
  const valW = 75

  doc.font('Helvetica').fontSize(9).fillColor('#333333')

  // Netto per VAT group
  for (const group of vatGroups) {
    doc.text(`Nettopreis ${group.rate}%`, labelX, y, { width: 120 })
    doc.text(`${formatCHF(group.netAmount)} CHF`, valX, y, { width: valW, align: 'right' })
    y += 14
  }

  // VAT per group
  for (const group of vatGroups) {
    doc.text(`Zzgl. ${group.rate}% MWST`, labelX, y, { width: 120 })
    doc.text(`${formatCHF(group.vatAmount)} CHF`, valX, y, { width: valW, align: 'right' })
    y += 14
  }

  // Total separator
  y += 2
  doc.strokeColor('#1a1a1a').lineWidth(0.8).moveTo(labelX, y).lineTo(RE, y).stroke()
  y += 8

  // Rechnungsbetrag
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a1a')
  doc.text('Rechnungsbetrag', labelX, y, { width: 120 })
  doc.text(`${formatCHF(totalGross)} CHF`, valX, y, { width: valW, align: 'right' })

  // BEZAHLT badge
  if (data.isPaid) {
    y += 20
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#16a34a')
    doc.text('BEZAHLT', labelX, y, { width: 120 + valW, align: 'right' })
    doc.fillColor('#000000')
  }

  // ─── CLOSING TEXT ───
  y += 35
  doc.font('Helvetica').fontSize(8.5).fillColor('#555555')
  if (!data.isPaid) {
    doc.text(
      `Bitte ueberweisen Sie den Rechnungsbetrag innerhalb von ${data.paymentTermDays} Tagen auf unser unten genanntes Konto.`,
      ML, y, { width: CW },
    )
    y += 12
  }
  doc.text('Fuer weitere Fragen stehen wir Ihnen sehr gerne zur Verfuegung.', ML, y, { width: CW })
  y += 18
  doc.text('Mit freundlichen Gruessen', ML, y)

  // ─── PAGE FOOTER ───
  const footerY = 780
  doc.strokeColor('#cccccc').lineWidth(0.3).moveTo(ML, footerY).lineTo(RE, footerY).stroke()

  const fY = footerY + 8
  doc.font('Helvetica').fontSize(7).fillColor('#999999')

  // 3 columns
  doc.text(company.name, ML, fY)
  doc.text(company.address.street, ML, fY + 9)
  doc.text(`${company.address.zip} ${company.address.city}`, ML, fY + 18)

  doc.text('UBS Switzerland AG', ML + CW / 3, fY)
  doc.text(`IBAN: ${formatIBAN(brand.iban)}`, ML + CW / 3, fY + 9)

  doc.text(`MWST-ID: ${company.uid}`, ML + (CW * 2) / 3, fY, { width: CW / 3, align: 'right' })

  doc.fillColor('#000000')

  // ─── QR BILL ───
  if (!data.isPaid) {
    try {
      const qrData = buildQrBillData(data, company, brand, totalGross)
      const qrBill = new SwissQRBill(qrData)
      qrBill.attachTo(doc)
    } catch (err) {
      console.warn('QR Bill rendering failed:', err)
    }
  }

  doc.end()

  return new Promise<string>((resolve, reject) => {
    stream.on('finish', () => {
      try {
        const blob = stream.toBlob('application/pdf')
        resolve(URL.createObjectURL(blob))
      } catch (err) {
        reject(err)
      }
    })
    stream.on('error', reject)
  })
}

/**
 * Trigger download of a blob URL.
 */
export function downloadPdf(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
