import { formatCHF } from '@/lib/swiss-format'
import { Separator } from '@/components/ui/separator'

interface InvoiceTotalsProps {
  totalNet: number
  totalVat: number
  totalGross: number
}

export function InvoiceTotals({ totalNet, totalVat, totalGross }: InvoiceTotalsProps) {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Netto</span>
        <span>{formatCHF(totalNet)} CHF</span>
      </div>
      <div className="flex justify-between text-muted-foreground">
        <span>MWST</span>
        <span>{formatCHF(totalVat)} CHF</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>{formatCHF(totalGross)} CHF</span>
      </div>
    </div>
  )
}
