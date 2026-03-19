import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useCounterStore } from '@/store/counter-store'
import { getBrandById } from '@/config/companies'
import { generateInvoiceNumber } from '@/lib/invoice-number'
import { useEffect } from 'react'

interface InvoiceNumberProps {
  brandId: string
  invoiceNumber: string
  invoiceDate: string
  onInvoiceNumberChange: (num: string) => void
  onDateChange: (date: string) => void
}

export function InvoiceNumber({
  brandId,
  invoiceNumber,
  invoiceDate,
  onInvoiceNumberChange,
  onDateChange,
}: InvoiceNumberProps) {
  const peek = useCounterStore((s) => s.peek)
  const brand = getBrandById(brandId)

  // Auto-generate invoice number when brand changes
  useEffect(() => {
    if (brand && !invoiceNumber) {
      const year = new Date(invoiceDate).getFullYear()
      const nextSeq = peek(brand.shortCode, year)
      onInvoiceNumberChange(generateInvoiceNumber(brand.shortCode, year, nextSeq))
    }
  }, [brandId]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAutoGenerate() {
    if (!brand) return
    const year = new Date(invoiceDate).getFullYear()
    const nextSeq = peek(brand.shortCode, year)
    onInvoiceNumberChange(generateInvoiceNumber(brand.shortCode, year, nextSeq))
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Rechnungsdatum</Label>
        <Input
          type="date"
          value={invoiceDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Rechnungsnummer</Label>
        <div className="flex gap-2">
          <Input
            value={invoiceNumber}
            onChange={(e) => onInvoiceNumberChange(e.target.value)}
            placeholder="PBR-2026-0001"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoGenerate}
            disabled={!brand}
            className="shrink-0"
          >
            Auto
          </Button>
        </div>
      </div>
    </div>
  )
}
