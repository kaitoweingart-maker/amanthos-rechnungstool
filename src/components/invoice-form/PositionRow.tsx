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
    <tr>
      <td className="p-1">
        <Input
          value={position.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Beschreibung"
          className="text-sm"
        />
      </td>
      <td className="p-1">
        <Input
          type="number"
          min={0}
          step={1}
          value={position.quantity || ''}
          onChange={(e) => update('quantity', parseFloat(e.target.value) || 0)}
          className="w-20 text-sm text-right"
        />
      </td>
      <td className="p-1">
        <Input
          type="number"
          min={0}
          step={0.01}
          value={position.unitPrice || ''}
          onChange={(e) => update('unitPrice', parseFloat(e.target.value) || 0)}
          className="w-28 text-sm text-right"
        />
      </td>
      <td className="p-1">
        <Select
          value={String(position.vatRate)}
          onValueChange={(v) => { if (v) update('vatRate', parseFloat(v) as VatRate) }}
        >
          <SelectTrigger className="w-28 text-sm">
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
      <td className="p-1 text-right text-sm whitespace-nowrap pr-2">
        {formatCHF(netAmount)}
      </td>
      <td className="p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="text-destructive hover:text-destructive"
        >
          &times;
        </Button>
      </td>
    </tr>
  )
}
