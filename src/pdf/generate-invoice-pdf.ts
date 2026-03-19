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

const ML = 60
const MR = 60
const PW = 595.28
const CW = PW - ML - MR
const RE = PW - MR

async function fetchLogo(path: string): Promise<Buffer | null> {
  try {
    const r = await fetch(path)
    if (!r.ok) return null
    return Buffer.from(await r.arrayBuffer())
  } catch {
    return null
  }
}

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
    info: {
      Title: `Rechnung ${data.invoiceNumber}`,
      Author: company.name,
    },
  })

  const stream = doc.pipe(blobStream())

  // ─── HEADER AREA ───
  let y = 45

  // Logo top-right
  if (logo) {
    try {
      doc.image(logo, RE - 130, y, { fit: [130, 48] })
    } catch { /* skip */ }
  }

  // Company info - top right, below logo
  const compY = logo ? 100 : 50
  doc.font('Helvetica').fontSize(8.5).fillColor('#333333')
  doc.text(company.name, 340, compY, { width: RE - 340, align: 'right' })
  doc.text(company.address.street, 340, compY + 11, { width: RE - 340, align: 'right' })
  doc.text(`${company.address.zip} ${company.address.city}`, 340, compY + 22, { width: RE - 340, align: 'right' })

  // ─── DEBTOR (left, with sender line) ───
  const debY = logo ? 155 : 120
  // Small sender line
  doc.font('Helvetica').fontSize(6).fillColor('#bbbbbb')
  doc.text(
    `${company.name} · ${company.address.street} · ${company.address.zip} ${company.address.city}`,
    ML, debY,
  )
  // Debtor address
  doc.font('Helvetica').fontSize(10).fillColor('#1a1a1a')
  let dY = debY + 16
  const debtorLines = [data.debtor.name, data.debtor.street, `${data.debtor.zip} ${data.debtor.city}`]
  if (data.debtor.country && data.debtor.country !== 'CH' && data.debtor.country !== 'Schweiz') {
    debtorLines.push(data.debtor.country)
  }
  for (const line of debtorLines) {
    doc.text(line, ML, dY, { width: 250 })
    dY += 14
  }

  // ─── RIGHT SIDE: UID + IBAN (same height as debtor) ───
  doc.font('Helvetica').fontSize(7.5).fillColor('#888888')
  doc.text(`UID: ${company.uid}`, 340, debY + 16, { width: RE - 340, align: 'right' })
  doc.text(`IBAN: ${formatIBAN(brand.iban)}`, 340, debY + 27, { width: RE - 340, align: 'right' })

  // ─── DATE (right) ───
  y = dY + 25
  doc.font('Helvetica').fontSize(9).fillColor('#555555')
  doc.text(`Datum: ${formatDateCH(data.invoiceDate)}`, 340, y, { width: RE - 340, align: 'right' })

  // ─── INVOICE TITLE ───
  y += 28
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a1a1a')
  doc.text(`Rechnung ${data.invoiceNumber}`, ML, y, { width: CW })

  // ─── META ───
  y += 26
  doc.font('Helvetica').fontSize(8.5)
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
    doc.fillColor('#999999').text(label, ML, y, { width: 90 })
    doc.fillColor('#333333').text(value, ML + 95, y, { width: 200 })
    y += 13
  }

  // ─── POSITIONS TABLE ───
  y += 16

  // Top line
  doc.strokeColor('#1a1a1a').lineWidth(0.5).moveTo(ML, y).lineTo(RE, y).stroke()
  y += 6

  // Table header
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#555555')
  doc.text('Pos.', ML, y, { width: 28 })
  doc.text('Bezeichnung', ML + 32, y, { width: 200 })
  doc.text('Menge', 320, y, { width: 40, align: 'right' })
  doc.text('Einzelpreis', 370, y, { width: 65, align: 'right' })
  doc.text('MWST', 440, y, { width: 30, align: 'right' })
  doc.text('Gesamtpreis', RE - 70, y, { width: 70, align: 'right' })

  y += 14
  doc.strokeColor('#cccccc').lineWidth(0.3).moveTo(ML, y).lineTo(RE, y).stroke()
  y += 7

  // Table rows
  doc.font('Helvetica').fontSize(9).fillColor('#1a1a1a')
  data.positions.forEach((pos, i) => {
    const net = positionNetAmount(pos)
    doc.text(`${i + 1}`, ML, y, { width: 28 })
    doc.text(pos.description, ML + 32, y, { width: 200 })
    doc.text(String(pos.quantity), 320, y, { width: 40, align: 'right' })
    doc.text(`${formatCHF(pos.unitPrice)} CHF`, 370, y, { width: 65, align: 'right' })
    doc.text(`${pos.vatRate}%`, 440, y, { width: 30, align: 'right' })
    doc.text(`${formatCHF(net)} CHF`, RE - 70, y, { width: 70, align: 'right' })
    y += 16
  })

  // Double bottom line
  y += 2
  doc.strokeColor('#1a1a1a').lineWidth(0.5).moveTo(ML, y).lineTo(RE, y).stroke()
  y += 3
  doc.strokeColor('#1a1a1a').lineWidth(0.3).moveTo(ML, y).lineTo(RE, y).stroke()

  // ─── TOTALS (right-aligned) ───
  y += 16
  const totLabelX = RE - 200
  const totValX = RE - 80
  const totValW = 80

  doc.font('Helvetica').fontSize(9).fillColor('#333333')
  for (const g of vatGroups) {
    doc.text(`Nettopreis`, totLabelX, y, { width: 110 })
    doc.text(`${formatCHF(g.netAmount)} CHF`, totValX, y, { width: totValW, align: 'right' })
    y += 14
  }
  for (const g of vatGroups) {
    doc.text(`Zzgl. ${g.rate}% MWST`, totLabelX, y, { width: 110 })
    doc.text(`${formatCHF(g.vatAmount)} CHF`, totValX, y, { width: totValW, align: 'right' })
    y += 14
  }

  // Separator + Total
  y += 2
  doc.strokeColor('#1a1a1a').lineWidth(0.7).moveTo(totLabelX, y).lineTo(RE, y).stroke()
  y += 8
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a1a1a')
  doc.text('Rechnungsbetrag', totLabelX, y, { width: 110 })
  doc.text(`${formatCHF(totalGross)} CHF`, totValX, y, { width: totValW, align: 'right' })

  if (data.isPaid) {
    y += 22
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#16a34a')
    doc.text('BEZAHLT', totLabelX, y, { width: 110 + totValW, align: 'right' })
  }

  // ─── CLOSING TEXT ───
  y += 35
  doc.font('Helvetica').fontSize(8.5).fillColor('#555555')
  if (!data.isPaid) {
    doc.text(
      `Bitte ueberweisen Sie den Rechnungsbetrag innerhalb von ${data.paymentTermDays} Tagen auf unser unten genanntes Konto.`,
      ML, y, { width: CW },
    )
    y += 22
  }
  doc.text('Fuer weitere Fragen stehen wir Ihnen sehr gerne zur Verfuegung.', ML, y, { width: CW })
  y += 18
  doc.text('Mit freundlichen Gruessen', ML, y)

  // ─── FOOTER (bottom of page 1) ───
  const footY = 775
  doc.strokeColor('#dddddd').lineWidth(0.3).moveTo(ML, footY).lineTo(RE, footY).stroke()
  doc.font('Helvetica').fontSize(6.5).fillColor('#aaaaaa')
  const col1X = ML
  const col2X = ML + CW * 0.35
  const col3X = ML + CW * 0.7
  doc.text(company.name, col1X, footY + 7, { width: CW * 0.3 })
  doc.text(company.address.street, col1X, footY + 16, { width: CW * 0.3 })
  doc.text(`${company.address.zip} ${company.address.city}`, col1X, footY + 25, { width: CW * 0.3 })
  doc.text('UBS Switzerland AG', col2X, footY + 7, { width: CW * 0.3 })
  doc.text(`IBAN: ${formatIBAN(brand.iban)}`, col2X, footY + 16, { width: CW * 0.3 })
  doc.text(`MWST-ID: ${company.uid}`, col3X, footY + 7, { width: CW * 0.3, align: 'right' })
  doc.fillColor('#000000')

  // ─── QR BILL (on a new page) ───
  if (!data.isPaid) {
    try {
      const qrData = buildQrBillData(data, company, brand, totalGross)
      const qrBill = new SwissQRBill(qrData)
      // Add a dedicated page for the QR bill
      doc.addPage({ size: 'A4', margin: 0 })
      const qrY = doc.page.height - SwissQRBill.height
      qrBill.attachTo(doc, 0, qrY)
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

export function downloadPdf(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
