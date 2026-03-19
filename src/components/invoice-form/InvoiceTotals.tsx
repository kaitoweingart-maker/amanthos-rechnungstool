import { formatCHF } from '@/lib/swiss-format'

interface InvoiceTotalsProps {
  totalNet: number
  totalVat: number
  totalGross: number
}

export function InvoiceTotals({ totalNet, totalVat, totalGross }: InvoiceTotalsProps) {
  return (
    <div className="space-y-1.5 text-sm tabular-nums">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Netto</span>
        <span>{formatCHF(totalNet)} CHF</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">MWST</span>
        <span>{formatCHF(totalVat)} CHF</span>
      </div>
      <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
        <span>Total</span>
        <span>{formatCHF(totalGross)} CHF</span>
      </div>
    </div>
  )
}
