import { useState, useMemo, useRef, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginScreen } from '@/components/layout/LoginScreen'
import { CompanySelector } from '@/components/invoice-form/CompanySelector'
import { InvoiceNumber } from '@/components/invoice-form/InvoiceNumber'
import { DebtorForm } from '@/components/invoice-form/DebtorForm'
import { PaymentTerms } from '@/components/invoice-form/PaymentTerms'
import { PositionsTable, createEmptyPosition } from '@/components/invoice-form/PositionsTable'
import { VatSummary } from '@/components/invoice-form/VatSummary'
import { InvoiceTotals } from '@/components/invoice-form/InvoiceTotals'
import { PdfPreviewDialog } from '@/components/pdf-preview/PdfPreviewDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { getBrandById, getCompanyForBrand } from '@/config/companies'
import { getDefaultVatRate } from '@/config/vat-rates'
import { DEFAULT_PAYMENT_TERM } from '@/config/constants'
import { todayISO, calculateDueDate, formatDateCH } from '@/lib/date-utils'
import { formatCHF, formatIBAN } from '@/lib/swiss-format'
import { calculateTotals } from '@/lib/vat-calculator'
import { invoiceSchema } from '@/lib/validation'
import { useCounterStore } from '@/store/counter-store'
import { generateInvoicePdf, downloadPdf } from '@/pdf/generate-invoice-pdf'
import type { DebtorAddress, InvoiceData, InvoicePosition, PaymentTermDays } from '@/types/invoice'

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('amanthos-auth') === 'true',
  )

  if (!authenticated) {
    return (
      <LoginScreen
        onSuccess={() => {
          sessionStorage.setItem('amanthos-auth', 'true')
          setAuthenticated(true)
        }}
      />
    )
  }

  return <InvoiceTool />
}

function InvoiceTool() {
  const [brandId, setBrandId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(todayISO())
  const [paymentTermDays, setPaymentTermDays] = useState<PaymentTermDays>(DEFAULT_PAYMENT_TERM)
  const [debtor, setDebtor] = useState<DebtorAddress>({
    name: '',
    street: '',
    zip: '',
    city: '',
    country: 'CH',
  })
  const [positions, setPositions] = useState<InvoicePosition[]>([createEmptyPosition()])
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const prevUrlRef = useRef<string | null>(null)

  const getNext = useCounterStore((s) => s.getNext)
  const brand = getBrandById(brandId)
  const company = getCompanyForBrand(brandId)

  const totals = useMemo(() => calculateTotals(positions), [positions])
  const dueDate = useMemo(
    () => calculateDueDate(invoiceDate, paymentTermDays),
    [invoiceDate, paymentTermDays],
  )

  const defaultVatRate = useMemo(
    () => (company ? getDefaultVatRate(company.id) : 8.1 as const),
    [company],
  )

  const pdfFilename = `Rechnung_${invoiceNumber || 'entwurf'}.pdf`

  const handleBrandChange = useCallback((newBrandId: string) => {
    setBrandId(newBrandId)
    setInvoiceNumber('')
    // Reset positions with correct VAT rate for new company
    const newBrand = getBrandById(newBrandId)
    if (newBrand) {
      const newCompany = getCompanyForBrand(newBrandId)
      const vatRate = newCompany ? getDefaultVatRate(newCompany.id) : 8.1 as const
      setPositions([createEmptyPosition(vatRate)])
    }
  }, [])

  function buildInvoiceData(): InvoiceData {
    return {
      brandId,
      invoiceNumber,
      invoiceDate,
      paymentTermDays,
      debtor,
      positions,
      notes,
    }
  }

  function validateForm(): boolean {
    const data = buildInvoiceData()
    const result = invoiceSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        fieldErrors[path] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    return true
  }

  async function handlePreview() {
    if (!validateForm()) return
    setGenerating(true)
    try {
      const url = await generateInvoicePdf(buildInvoiceData())
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)
      prevUrlRef.current = url
      setPreviewUrl(url)
      setPreviewOpen(true)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF-Erstellung fehlgeschlagen. Siehe Konsole fuer Details.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload() {
    if (!validateForm()) return
    setGenerating(true)
    try {
      if (brand) {
        const year = new Date(invoiceDate).getFullYear()
        getNext(brand.shortCode, year)
      }
      const url = await generateInvoicePdf(buildInvoiceData())
      downloadPdf(url, pdfFilename)
      // Don't revoke immediately - give browser time to process
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF-Erstellung fehlgeschlagen. Siehe Konsole fuer Details.')
    } finally {
      setGenerating(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Gesellschaft & Rechnungsdaten */}
            <Card>
              <CardContent className="p-5 space-y-5">
                <div>
                  <h2 className="text-base font-semibold mb-3">Absender</h2>
                  <CompanySelector brandId={brandId} onBrandChange={handleBrandChange} />
                </div>
                <Separator />
                <div>
                  <h2 className="text-base font-semibold mb-3">Rechnungsdaten</h2>
                  <InvoiceNumber
                    brandId={brandId}
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                    onInvoiceNumberChange={setInvoiceNumber}
                    onDateChange={setInvoiceDate}
                  />
                  <div className="mt-3">
                    <PaymentTerms value={paymentTermDays} onChange={setPaymentTermDays} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Empfaenger */}
            <Card>
              <CardContent className="p-5">
                <DebtorForm debtor={debtor} onChange={setDebtor} errors={errors} />
              </CardContent>
            </Card>

            {/* Positionen & Totals */}
            <Card>
              <CardContent className="p-5 space-y-5">
                <PositionsTable
                  positions={positions}
                  onChange={setPositions}
                  defaultVatRate={defaultVatRate}
                />
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <VatSummary vatGroups={totals.vatGroups} />
                  <InvoiceTotals
                    totalNet={totals.totalNet}
                    totalVat={totals.totalVat}
                    totalGross={totals.totalGross}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bemerkungen */}
            <Card>
              <CardContent className="p-5">
                <Label className="text-sm font-medium">Bemerkungen (optional)</Label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Zusaetzliche Bemerkungen auf der Rechnung..."
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary + Actions (sticky) */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-base">Zusammenfassung</h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="Gesellschaft" value={company?.name ?? '–'} />
                  <SummaryRow label="Marke" value={brand?.label ?? '–'} />
                  <SummaryRow label="UID" value={company?.uid ?? '–'} />
                  <SummaryRow
                    label="IBAN"
                    value={brand ? formatIBAN(brand.iban) : '–'}
                    mono
                  />
                  <Separator />
                  <SummaryRow label="Rechnungsnr." value={invoiceNumber || '–'} mono />
                  <SummaryRow label="Datum" value={formatDateCH(invoiceDate)} />
                  <SummaryRow label="Faellig" value={formatDateCH(dueDate)} />
                  <Separator />
                  <SummaryRow label="Netto" value={`${formatCHF(totals.totalNet)} CHF`} />
                  <SummaryRow
                    label="MWST"
                    value={`${formatCHF(totals.totalVat)} CHF`}
                    muted
                  />
                  <Separator />
                  <div className="flex justify-between font-semibold text-base pt-1">
                    <span>Total</span>
                    <span>{formatCHF(totals.totalGross)} CHF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={handlePreview}
                disabled={generating || !brandId}
              >
                Vorschau
              </Button>
              <Button
                className="w-full h-12 text-base font-semibold"
                onClick={handleDownload}
                disabled={generating || !brandId}
              >
                {generating ? 'Wird erstellt...' : 'PDF herunterladen'}
              </Button>
            </div>

            {hasErrors && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <p className="text-sm text-destructive font-medium">
                  Bitte alle Pflichtfelder ausfuellen.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <PdfPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfUrl={previewUrl}
        filename={pdfFilename}
      />
    </div>
  )
}

function SummaryRow({
  label,
  value,
  mono,
  muted,
}: {
  label: string
  value: string
  mono?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right truncate ${mono ? 'font-mono text-xs' : ''} ${muted ? 'text-muted-foreground' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
