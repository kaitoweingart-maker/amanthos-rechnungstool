import { Button } from '@/components/ui/button'
import { PositionRow } from './PositionRow'
import { DEFAULT_VAT_RATE } from '@/config/vat-rates'
import type { InvoicePosition } from '@/types/invoice'

interface PositionsTableProps {
  positions: InvoicePosition[]
  onChange: (positions: InvoicePosition[]) => void
}

function createEmptyPosition(): InvoicePosition {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: DEFAULT_VAT_RATE,
  }
}

export function PositionsTable({ positions, onChange }: PositionsTableProps) {
  function addPosition() {
    onChange([...positions, createEmptyPosition()])
  }

  function updatePosition(index: number, position: InvoicePosition) {
    const next = [...positions]
    next[index] = position
    onChange(next)
  }

  function removePosition(index: number) {
    onChange(positions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Positionen</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="text-left p-1 font-medium">Beschreibung</th>
              <th className="text-right p-1 font-medium w-20">Menge</th>
              <th className="text-right p-1 font-medium w-28">Einzelpreis</th>
              <th className="text-left p-1 font-medium w-28">MWST</th>
              <th className="text-right p-1 font-medium w-24">Betrag</th>
              <th className="p-1 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <PositionRow
                key={pos.id}
                position={pos}
                onChange={(p) => updatePosition(i, p)}
                onRemove={() => removePosition(i)}
                canRemove={positions.length > 1}
              />
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addPosition}>
        + Position hinzufuegen
      </Button>
    </div>
  )
}

export { createEmptyPosition }
