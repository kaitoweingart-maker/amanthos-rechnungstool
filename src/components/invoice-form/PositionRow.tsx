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
  function update(field: keyof InvoicePosition, value: string | number) {
    onChange({ ...position, [field]: value })
  }

  const netAmount = positionNetAmount(position)

  return (
    <tr className="border-b border-muted/50 last:border-0">
      <td className="p-1.5">
        <Input
          value={position.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="z.B. Uebernachtung DZ"
          className="text-sm h-9"
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
        <Input
          type="number"
          min={0}
          step={0.05}
          value={position.unitPrice || ''}
          onChange={(e) => update('unitPrice', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="w-28 text-sm text-right h-9"
        />
      </td>
      <td className="p-1.5">
        <Select
          value={String(position.vatRate)}
          onValueChange={(v) => { if (v) update('vatRate', parseFloat(v) as VatRate) }}
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
