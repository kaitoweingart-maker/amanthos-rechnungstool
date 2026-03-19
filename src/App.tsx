import { useState, useMemo, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getBrandById, getCompanyForBrand } from '@/config/companies'
import { DEFAULT_PAYMENT_TERM } from '@/config/constants'
import { todayISO, calculateDueDate, formatDateCH } from '@/lib/date-utils'
import { formatCHF, formatIBAN } from '@/lib/swiss-format'
import { calculateTotals } from '@/lib/vat-calculator'
import { invoiceSchema } from '@/lib/validation'
import { useCounterStore } from '@/store/counter-store'
import { generateInvoicePdf, downloadPdf } from '@/pdf/generate-invoice-pdf'
import type { DebtorAddress, InvoiceData, InvoicePosition, PaymentTermDays } from '@/types/invoice'

export default function App() {
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

  const pdfFilename = `Rechnung_${invoiceNumber || 'entwurf'}.pdf`

  function handleBrandChange(newBrandId: string) {
    setBrandId(newBrandId)
    setInvoiceNumber('')
  }

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
      // Revoke previous URL
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
      // Increment counter when downloading
      if (brand) {
        const year = new Date(invoiceDate).getFullYear()
        getNext(brand.shortCode, year)
      }

      const url = await generateInvoicePdf(buildInvoiceData())
      downloadPdf(url, pdfFilename)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF-Erstellung fehlgeschlagen. Siehe Konsole fuer Details.')
    } finally {
      setGenerating(false)
    }
  }

  function handlePreviewClose() {
    setPreviewOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <CompanySelector brandId={brandId} onBrandChange={handleBrandChange} />
                <Separator />
                <InvoiceNumber
                  brandId={brandId}
                  invoiceNumber={invoiceNumber}
                  invoiceDate={invoiceDate}
                  onInvoiceNumberChange={setInvoiceNumber}
                  onDateChange={setInvoiceDate}
                />
                <Separator />
                <DebtorForm debtor={debtor} onChange={setDebtor} errors={errors} />
                <Separator />
                <PaymentTerms value={paymentTermDays} onChange={setPaymentTermDays} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <PositionsTable positions={positions} onChange={setPositions} />
                <Separator />
                <VatSummary vatGroups={totals.vatGroups} />
                <Separator />
                <InvoiceTotals
                  totalNet={totals.totalNet}
                  totalVat={totals.totalVat}
                  totalGross={totals.totalGross}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Label>Bemerkungen (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Zusaetzliche Bemerkungen auf der Rechnung..."
                  className="mt-1.5"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Summary + Actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium">Zusammenfassung</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gesellschaft</span>
                    <span>{company?.name ?? '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Marke</span>
                    <span>{brand?.label ?? '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UID</span>
                    <span>{company?.uid ?? '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IBAN</span>
                    <span className="text-xs font-mono">
                      {brand ? formatIBAN(brand.iban) : '–'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rechnungsnr.</span>
                    <span className="font-mono">{invoiceNumber || '–'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Datum</span>
                    <span>{formatDateCH(invoiceDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faellig</span>
                    <span>{formatDateCH(dueDate)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Netto</span>
                    <span>{formatCHF(totals.totalNet)} CHF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MWST</span>
                    <span>{formatCHF(totals.totalVat)} CHF</span>
                  </div>
                  <div className="flex justify-between font-semibold">
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
                className="w-full"
                size="lg"
                onClick={handleDownload}
                disabled={generating || !brandId}
              >
                {generating ? 'Wird erstellt...' : 'PDF erstellen & herunterladen'}
              </Button>
            </div>

            {Object.keys(errors).length > 0 && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive font-medium">
                    Bitte alle Pflichtfelder ausfuellen.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <PdfPreviewDialog
        open={previewOpen}
        onClose={handlePreviewClose}
        pdfUrl={previewUrl}
        filename={pdfFilename}
      />
    </div>
  )
}
