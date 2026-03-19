import PDFDocument from 'pdfkit'
import BlobStream from 'blob-stream'
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
 * Generate the PDF and return a blob URL for preview/download.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<string> {
  const brand = getBrandById(data.brandId)
  const company = getCompanyForBrand(data.brandId)
  if (!brand || !company) throw new Error('Brand/Company not found')

  const { totalNet, totalVat, totalGross, vatGroups } = calculateTotals(data.positions)

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    info: {
      Title: `Rechnung ${data.invoiceNumber}`,
      Author: company.name,
    },
  })

  const stream = doc.pipe(BlobStream())

  // Render sections sequentially, tracking Y position
  let y = renderHeader(doc, company, brand)
  y = renderSenderLine(doc, company, y)
  y = renderDebtor(doc, data.debtor, y)
  y = renderMeta(doc, data.invoiceNumber, data.invoiceDate, data.paymentTermDays, y)
  y = renderPositionsTable(doc, data.positions, y)
  y = renderVatSummary(doc, vatGroups, y)
  y = renderTotals(doc, totalNet, totalVat, totalGross, y)

  // Notes
  if (data.notes) {
    y += 10
    doc
      .font('Helvetica')
      .fontSize(FONT_SIZE_NORMAL)
      .fillColor('#666666')
      .text(`Bemerkung: ${data.notes}`, MARGIN_LEFT, y)
      .fillColor('#000000')
  }

  // Render QR bill
  try {
    const { SwissQRBill } = await import('swissqrbill/pdf')
    const qrData = buildQrBillData(data, company, brand, totalGross)
    const qrBill = new SwissQRBill(qrData)
    qrBill.attachTo(doc)
  } catch (err) {
    console.error('QR Bill rendering failed:', err)
  }

  doc.end()

  // Wait for stream to finish and return blob URL
  return new Promise<string>((resolve, reject) => {
    stream.on('finish', () => {
      const blob = stream.toBlob('application/pdf')
      const url = URL.createObjectURL(blob)
      resolve(url)
    })
    stream.on('error', reject)
  })
}

/**
 * Trigger download of a blob URL.
 */
export function downloadPdf(url: string, filename: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}
