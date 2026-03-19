import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LoginScreen } from '@/components/layout/LoginScreen'
import { CompanySelector } from '@/components/invoice-form/CompanySelector'
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
import { generateInvoiceNumber } from '@/lib/invoice-number'
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
  // Check for ?brand= URL parameter (direct brand links)
  const urlBrandId = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const b = params.get('brand')
    return b && getBrandById(b) ? b : ''
  }, [])
  const isDirectLink = !!urlBrandId

  const [brandId, setBrandId] = useState(urlBrandId)
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
  const [positions, setPositions] = useState<InvoicePosition[]>([])
  const [notes, setNotes] = useState('')
  const [isPaid, setIsPaid] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentDate, setPaymentDate] = useState(todayISO())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const prevUrlRef = useRef<string | null>(null)
  const initialized = useRef(false)

  const getNext = useCounterStore((s) => s.getNext)
  const peek = useCounterStore((s) => s.peek)

  // Initialize positions and invoice number for direct brand links
  useEffect(() => {
    if (urlBrandId && !initialized.current) {
      initialized.current = true
      const b = getBrandById(urlBrandId)
      if (b) {
        const c = getCompanyForBrand(urlBrandId)
        const vatRate = c ? getDefaultVatRate(c.id) : 3.8 as const
        setPositions([createEmptyPosition(vatRate)])
        const year = new Date(invoiceDate).getFullYear()
        const nextSeq = peek(b.shortCode, year)
        setInvoiceNumber(generateInvoiceNumber(b.shortCode, year, nextSeq))
      }
    }
  }, [urlBrandId, invoiceDate, peek])
  const brand = getBrandById(brandId)
  const company = getCompanyForBrand(brandId)

  const totals = useMemo(() => calculateTotals(positions), [positions])
  const dueDate = useMemo(
    () => calculateDueDate(invoiceDate, paymentTermDays),
    [invoiceDate, paymentTermDays],
  )

  const defaultVatRate = useMemo(
    () => (company ? getDefaultVatRate(company.id) : 3.8 as const),
    [company],
  )

  const pdfFilename = `Rechnung_${brand?.invoiceLabel ? brand.invoiceLabel.replace(/\s+/g, '_') + '_' : ''}${invoiceNumber || 'entwurf'}.pdf`

  // When brand changes: auto-generate invoice number, reset positions with correct VAT
  const handleBrandChange = useCallback((newBrandId: string) => {
    setBrandId(newBrandId)
    const newBrand = getBrandById(newBrandId)
    if (newBrand) {
      const newCompany = getCompanyForBrand(newBrandId)
      const vatRate = newCompany ? getDefaultVatRate(newCompany.id) : 3.8 as const
      setPositions([createEmptyPosition(vatRate)])
      // Auto-generate invoice number immediately
      const year = new Date(invoiceDate).getFullYear()
      const nextSeq = peek(newBrand.shortCode, year)
      setInvoiceNumber(generateInvoiceNumber(newBrand.shortCode, year, nextSeq))
    } else {
      setPositions([])
      setInvoiceNumber('')
    }
  }, [invoiceDate, peek])

  function buildInvoiceData(): InvoiceData {
    return {
      brandId,
      invoiceNumber,
      invoiceDate,
      paymentTermDays,
      debtor,
      positions,
      notes,
      isPaid,
      paymentInfo: isPaid ? { method: paymentMethod, date: paymentDate } : undefined,
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
      const msg = err instanceof Error ? err.message : String(err)
      alert(`PDF-Erstellung fehlgeschlagen: ${msg}`)
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
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('PDF generation failed:', err)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`PDF-Erstellung fehlgeschlagen: ${msg}`)
    } finally {
      setGenerating(false)
    }
  }

  const hasErrors = Object.keys(errors).length > 0
  const brandSelected = !!brandId

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 sm:px-6">
        {/* Step 1: Select company (hidden for direct brand links) */}
        {isDirectLink ? (
          <Card className="mb-4 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {brand?.logo ? (
                    <img src={brand.logo} alt={brand.label} className="h-10 w-auto max-w-[120px] object-contain" />
                  ) : (
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {brand?.label?.charAt(0) ?? 'A'}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold">{brand?.label}</p>
                    <p className="text-xs text-muted-foreground">{company?.name}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{company?.uid}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4 border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                <h2 className="text-base font-semibold">Absender waehlen</h2>
              </div>
              <CompanySelector brandId={brandId} onBrandChange={handleBrandChange} />
            </CardContent>
          </Card>
        )}

        {brandSelected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Rechnungsdaten + Empfaenger nebeneinander */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{isDirectLink ? 1 : 2}</span>
                      <h2 className="text-base font-semibold">Rechnungsdaten</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Rechnungsdatum</Label>
                        <input
                          type="date"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Rechnungsnummer</Label>
                        <input
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <PaymentTerms value={paymentTermDays} onChange={setPaymentTermDays} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{isDirectLink ? 2 : 3}</span>
                      <h2 className="text-base font-semibold">Empfaenger</h2>
                    </div>
                    <DebtorForm debtor={debtor} onChange={setDebtor} errors={errors} />
                  </CardContent>
                </Card>
              </div>

              {/* Positionen */}
              <Card className="border-primary/20">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{isDirectLink ? 3 : 4}</span>
                    <h2 className="text-base font-semibold">Positionen</h2>
                  </div>
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

              {/* Zahlung & Bemerkungen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={(e) => setIsPaid(e.target.checked)}
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        <span className="text-sm font-medium">Bereits bezahlt</span>
                      </label>
                    </div>
                    {isPaid && (
                      <div className="space-y-2.5">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Zahlungsart</Label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">Bitte waehlen...</option>
                            <option value="Kreditkarte">Kreditkarte</option>
                            <option value="Bankueberweisung">Bankueberweisung</option>
                            <option value="TWINT">TWINT</option>
                            <option value="Bargeld">Bargeld</option>
                            <option value="Debitkarte">Debitkarte</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Bezahlt am</Label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                    )}
                    {!isPaid && (
                      <p className="text-xs text-muted-foreground">
                        Aktivieren, wenn der Gast bereits bezahlt hat. Die Rechnung wird ohne QR-Einzahlungsschein erstellt.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <Label className="text-sm font-medium text-muted-foreground">Bemerkungen (optional)</Label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Zusaetzliche Bemerkungen auf der Rechnung..."
                      rows={3}
                      className="mt-1.5 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Summary (sticky) */}
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <Card className="shadow-md border-primary/10 overflow-hidden">
                <div className="bg-primary/5 px-5 py-3 border-b border-primary/10 flex items-center justify-between">
                  <h3 className="font-semibold text-base">Zusammenfassung</h3>
                  {brand?.logo && (
                    <img src={brand.logo} alt={brand.label} className="h-8 w-auto max-w-[100px] object-contain" />
                  )}
                </div>
                <CardContent className="p-5 space-y-3">
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
                  </div>
                </CardContent>
                <div className="bg-primary/5 px-5 py-4 border-t border-primary/10">
                  <div className="space-y-1 text-sm tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Netto</span>
                      <span>{formatCHF(totals.totalNet)} CHF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MWST</span>
                      <span>{formatCHF(totals.totalVat)} CHF</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-1">
                      <span>Total</span>
                      <span className="text-primary">{formatCHF(totals.totalGross)} CHF</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handlePreview}
                  disabled={generating}
                >
                  Vorschau
                </Button>
                <Button
                  className="w-full h-12 text-base font-semibold shadow-lg"
                  onClick={handleDownload}
                  disabled={generating}
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
        )}

        {!brandSelected && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">&#9997;</div>
            <p className="text-lg font-medium">Waehle zuerst eine Gesellschaft und Marke</p>
            <p className="text-sm">um eine Rechnung zu erstellen</p>
          </div>
        )}
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
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}
