import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { VAT_RATES } from '@/config/vat-rates'
import { formatCHF } from '@/lib/swiss-format'
import { positionNetAmount } from '@/lib/vat-calculator'
import type { InvoicePosition, VatRate } from '@/types/invoice'

interface PositionRowProps {
  position: InvoicePosition
  onChange: (position: InvoicePosition) => void
  onRemove: () => void
  canRemove: boolean
}

export function PositionRow({ position, onChange, onRemove, canRemove }: PositionRowProps) {
  const [grossMode, setGrossMode] = useState(false)
  const [grossValue, setGrossValue] = useState('')

  function update(field: keyof InvoicePosition, value: string | number) {
    onChange({ ...position, [field]: value })
  }

  // When switching to gross mode, pre-fill with current gross value
  useEffect(() => {
    if (grossMode && position.unitPrice > 0) {
      const gross = position.unitPrice * (1 + position.vatRate / 100)
      setGrossValue(gross.toFixed(2))
    }
  }, [grossMode])

  // When gross value changes, calculate and set net price
  function handleGrossChange(val: string) {
    setGrossValue(val)
    const gross = parseFloat(val)
    if (!isNaN(gross) && gross > 0) {
      const net = Math.round((gross / (1 + position.vatRate / 100)) * 100) / 100
      onChange({ ...position, unitPrice: net })
    }
  }

  // Recalculate net when VAT rate changes in gross mode
  function handleVatChange(newRate: VatRate) {
    if (grossMode && grossValue) {
      const gross = parseFloat(grossValue)
      if (!isNaN(gross) && gross > 0) {
        const net = Math.round((gross / (1 + newRate / 100)) * 100) / 100
        onChange({ ...position, vatRate: newRate, unitPrice: net })
        return
      }
    }
    update('vatRate', newRate)
  }

  const netAmount = positionNetAmount(position)
  const descEmpty = !position.description.trim()
  const priceEmpty = !position.unitPrice

  return (
    <tr className="border-b border-muted/50 last:border-0">
      <td className="p-1.5">
        <Input
          value={position.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="z.B. Uebernachtung DZ"
          className={`text-sm h-9 ${descEmpty ? 'border-primary/40 bg-primary/5' : ''}`}
        />
      </td>
      <td className="p-1.5">
        <Input
          type="number"
          min={0}
          step={1}
          value={position.quantity || ''}
          onChange={(e) => update('quantity', parseFloat(e.target.value) || 0)}
          className="w-20 text-sm text-right h-9"
        />
      </td>
      <td className="p-1.5">
        <div className="flex flex-col gap-1">
          {grossMode ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                step={0.05}
                value={grossValue}
                onChange={(e) => handleGrossChange(e.target.value)}
                placeholder="Brutto"
                className="w-28 text-sm text-right h-9 border-amber-400/60 bg-amber-50/50"
              />
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              step={0.05}
              value={position.unitPrice || ''}
              onChange={(e) => update('unitPrice', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={`w-28 text-sm text-right h-9 ${priceEmpty ? 'border-primary/40 bg-primary/5' : ''}`}
            />
          )}
          <button
            type="button"
            onClick={() => setGrossMode(!grossMode)}
            className={`text-[10px] leading-none px-1 py-0.5 rounded w-fit ${
              grossMode
                ? 'text-amber-700 bg-amber-100 font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {grossMode
              ? `Netto: ${formatCHF(position.unitPrice)}`
              : 'Brutto eingeben'}
          </button>
        </div>
      </td>
      <td className="p-1.5">
        <Select
          value={String(position.vatRate)}
          onValueChange={(v) => { if (v) handleVatChange(parseFloat(v) as VatRate) }}
        >
          <SelectTrigger className="w-32 text-sm h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VAT_RATES.map((r) => (
              <SelectItem key={r.value} value={String(r.value)}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-1.5 text-right text-sm font-medium whitespace-nowrap pr-2 tabular-nums">
        {formatCHF(netAmount)}
      </td>
      <td className="p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
        >
          &times;
        </Button>
      </td>
    </tr>
  )
}
