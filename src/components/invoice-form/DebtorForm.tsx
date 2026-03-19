import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { DebtorAddress } from '@/types/invoice'

interface DebtorFormProps {
  debtor: DebtorAddress
  onChange: (debtor: DebtorAddress) => void
  errors?: Record<string, string>
}

export function DebtorForm({ debtor, onChange, errors }: DebtorFormProps) {
  function update(field: keyof DebtorAddress, value: string) {
    onChange({ ...debtor, [field]: value })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Rechnungsempfaenger</h3>
      <div className="space-y-2">
        <div>
          <Label>Name / Firma</Label>
          <Input
            value={debtor.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Firma GmbH"
          />
          {errors?.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <Label>Strasse</Label>
          <Input
            value={debtor.street}
            onChange={(e) => update('street', e.target.value)}
            placeholder="Musterstrasse 1"
          />
          {errors?.street && (
            <p className="text-xs text-destructive mt-1">{errors.street}</p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>PLZ</Label>
            <Input
              value={debtor.zip}
              onChange={(e) => update('zip', e.target.value)}
              placeholder="8000"
            />
            {errors?.zip && (
              <p className="text-xs text-destructive mt-1">{errors.zip}</p>
            )}
          </div>
          <div className="col-span-2">
            <Label>Ort</Label>
            <Input
              value={debtor.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="Zuerich"
            />
            {errors?.city && (
              <p className="text-xs text-destructive mt-1">{errors.city}</p>
            )}
          </div>
        </div>
        <div>
          <Label>Land</Label>
          <Input
            value={debtor.country}
            onChange={(e) => update('country', e.target.value)}
            placeholder="CH"
          />
        </div>
      </div>
    </div>
  )
}
