import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { InvoicePosition, VatRate } from '@/types/invoice'

interface PositionPresetsProps {
  onAdd: (position: InvoicePosition) => void
}

export function PositionPresets({ onAdd }: PositionPresetsProps) {
  const [showLogis, setShowLogis] = useState(false)
  const [checkin, setCheckin] = useState('')
  const [checkout, setCheckout] = useState('')

  function addParking() {
    // 20 CHF inkl. MWST → Netto = 20 / 1.081
    onAdd({
      id: crypto.randomUUID(),
      description: 'Parking',
      quantity: 1,
      unitPrice: Math.round((20 / 1.081) * 100) / 100,
      vatRate: 8.1,
    })
  }

  function addBarTrinken() {
    onAdd({
      id: crypto.randomUUID(),
      description: 'Bar / Trinken',
      quantity: 1,
      unitPrice: 0,
      vatRate: 8.1,
    })
  }

  function addLogis() {
    if (!checkin || !checkout) return
    const nights = Math.max(1, Math.round(
      (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000,
    ))
    const ciFormatted = formatDateDE(checkin)
    const coFormatted = formatDateDE(checkout)
    onAdd({
      id: crypto.randomUUID(),
      description: `Logis ${ciFormatted} – ${coFormatted}`,
      quantity: nights,
      unitPrice: 0,
      vatRate: 3.8 as VatRate,
    })
    setShowLogis(false)
    setCheckin('')
    setCheckout('')
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium">Schnellauswahl</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addParking}>
          Parking (20 CHF/Nacht)
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addBarTrinken}>
          Bar / Trinken
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowLogis(!showLogis)}
          className={showLogis ? 'ring-1 ring-primary' : ''}
        >
          Logis (Beherbergung)
        </Button>
      </div>
      {showLogis && (
        <div className="flex flex-wrap items-end gap-3 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Check-in</Label>
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Check-out</Label>
            <input
              type="date"
              value={checkout}
              min={checkin || undefined}
              onChange={(e) => setCheckout(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {checkin && checkout && (
            <span className="text-xs text-muted-foreground pb-2">
              {Math.max(1, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000))} Naechte
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={addLogis}
            disabled={!checkin || !checkout}
          >
            Hinzufuegen
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLogis(false)}
          >
            Abbrechen
          </Button>
        </div>
      )}
    </div>
  )
}

function formatDateDE(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
