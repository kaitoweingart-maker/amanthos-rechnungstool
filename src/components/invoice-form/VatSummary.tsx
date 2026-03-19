import { formatCHF } from '@/lib/swiss-format'
import type { VatGroup } from '@/lib/vat-calculator'

interface VatSummaryProps {
  vatGroups: VatGroup[]
}

export function VatSummary({ vatGroups }: VatSummaryProps) {
  if (vatGroups.length === 0) return null

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">MWST-Aufschluesselung</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-left py-1 font-medium">Satz</th>
            <th className="text-right py-1 font-medium">Netto</th>
            <th className="text-right py-1 font-medium">MWST</th>
            <th className="text-right py-1 font-medium">Brutto</th>
          </tr>
        </thead>
        <tbody>
          {vatGroups.map((g) => (
            <tr key={g.rate} className="border-t">
              <td className="py-1">{g.rate}%</td>
              <td className="py-1 text-right">{formatCHF(g.netAmount)}</td>
              <td className="py-1 text-right">{formatCHF(g.vatAmount)}</td>
              <td className="py-1 text-right">{formatCHF(g.grossAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
