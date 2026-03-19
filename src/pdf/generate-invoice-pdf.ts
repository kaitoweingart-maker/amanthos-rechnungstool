import PDFDocument from 'pdfkit'
import blobStream from 'blob-stream'
import type { InvoiceData } from '@/types/invoice'
import { getBrandById, getCompanyForBrand } from '@/config/companies'
import { calculateTotals } from '@/lib/vat-calculator'
import { renderHeader, renderSenderLine } from './pdf-header'
import { renderDebtor } from './pdf-debtor'
import { renderMeta } from './pdf-meta'
import { renderPositionsTable } from './pdf-positions-table'
import { renderVatSummary } from './pdf-vat-summary'
import { renderTotals } from './pdf-totals'
import { buildQrBillData } from './qr-bill-data'
import { MARGIN_LEFT, FONT_SIZE_NORMAL } from './pdf-layout'

/**
 * Fetch a logo image and return it as a Buffer for PDFKit.
 */
async function fetchLogoBuffer(logoPath: string): Promise<Buffer | null> {
  try {
    const response = await fetch(logoPath)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

/**
 * Generate the PDF and return a blob URL for preview/download.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<string> {
  const brand = getBrandById(data.brandId)
  const company = getCompanyForBrand(data.brandId)
  if (!brand || !company) throw new Error('Brand/Company not found')

  const { totalNet, totalVat, totalGross, vatGroups } = calculateTotals(data.positions)

  // Pre-fetch logo
  const logoBuffer = brand.logo ? await fetchLogoBuffer(brand.logo) : null

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 45, bottom: 50, left: 56, right: 56 },
    autoFirstPage: true,
    bufferPages: true,
    info: {
      Title: `Rechnung ${data.invoiceNumber}`,
      Author: company.name,
    },
  })

  const stream = doc.pipe(blobStream())

  // Render sections
  let y = renderHeader(doc, company, brand, logoBuffer)
  y = renderSenderLine(doc, company, y)
  y = renderDebtor(doc, data.debtor, y)
  y = renderMeta(doc, data.invoiceNumber, data.invoiceDate, data.paymentTermDays, y, data.isPaid, data.paymentInfo)
  y = renderPositionsTable(doc, data.positions, y)
  y = renderVatSummary(doc, vatGroups, y)
  y = renderTotals(doc, totalNet, totalVat, totalGross, y, data.isPaid)

  // Notes
  if (data.notes) {
    y += 6
    doc
      .font('Helvetica')
      .fontSize(FONT_SIZE_NORMAL)
      .fillColor('#777777')
      .text(`Bemerkung: ${data.notes}`, MARGIN_LEFT, y)
      .fillColor('#000000')
  }

  // Render QR bill (only if NOT paid - paid invoices don't need payment slip)
  if (!data.isPaid) {
    try {
      const { SwissQRBill } = await import('swissqrbill/pdf')
      const qrData = buildQrBillData(data, company, brand, totalGross)
      const qrBill = new SwissQRBill(qrData)
      qrBill.attachTo(doc)
    } catch (err) {
      console.warn('QR Bill rendering skipped:', err)
    }
  }

  doc.end()

  // Wait for stream to finish and return blob URL
  return new Promise<string>((resolve, reject) => {
    stream.on('finish', () => {
      try {
        const blob = stream.toBlob('application/pdf')
        const url = URL.createObjectURL(blob)
        resolve(url)
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
