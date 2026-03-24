import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCHF } from '@/lib/swiss-format'

const RATES = [3.8, 8.1] as const

export function MwstCalculator() {
  const [brutto, setBrutto] = useState('')
  const [rate, setRate] = useState<number>(8.1)
  const [copied, setCopied] = useState(false)

  const bruttoNum = parseFloat(brutto) || 0
  const netto = Math.round((bruttoNum / (1 + rate / 100)) * 100) / 100
  const mwst = Math.round((bruttoNum - netto) * 100) / 100

  function copyNetto() {
    navigator.clipboard.writeText(netto.toFixed(2))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
      <p className="text-xs font-medium text-muted-foreground">MWST-Rechner (Brutto → Netto)</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Brutto (inkl. MWST)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={brutto}
            onChange={(e) => setBrutto(e.target.value)}
            placeholder="0.00"
            className="w-36 h-9 text-sm text-right"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Satz</Label>
          <div className="flex gap-1">
            {RATES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRate(r)}
                className={`h-9 px-3 rounded-md border text-sm transition-colors ${
                  rate === r
                    ? 'bg-primary text-primary-foreground border-primary font-medium'
                    : 'bg-transparent border-input hover:bg-accent'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
        {bruttoNum > 0 && (
          <div className="flex items-end gap-4 pb-0.5">
            <div className="text-sm tabular-nums">
              <span className="text-[11px] text-muted-foreground block">Netto (exkl. MWST)</span>
              <span className="font-bold text-base text-primary">{formatCHF(netto)}</span>
            </div>
            <div className="text-sm tabular-nums">
              <span className="text-[11px] text-muted-foreground block">MWST</span>
              <span className="font-medium">{formatCHF(mwst)}</span>
            </div>
            <button
              type="button"
              onClick={copyNetto}
              className="h-8 px-2.5 rounded-md border border-input bg-background text-xs hover:bg-accent transition-colors"
            >
              {copied ? 'Kopiert!' : 'Netto kopieren'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
