import { formatCHF } from '@/lib/swiss-format'
import type { VatGroup } from '@/lib/vat-calculator'

interface VatSummaryProps {
  vatGroups: VatGroup[]
}

export function VatSummary({ vatGroups }: VatSummaryProps) {
  if (vatGroups.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">MWST-Aufschluesselung</h3>
      <div className="space-y-1.5 text-sm">
        {vatGroups.map((g) => (
          <div key={g.rate} className="flex justify-between tabular-nums">
            <span className="text-muted-foreground">{g.rate}% auf {formatCHF(g.netAmount)}</span>
            <span>{formatCHF(g.vatAmount)} CHF</span>
          </div>
        ))}
      </div>
    </div>
  )
}
