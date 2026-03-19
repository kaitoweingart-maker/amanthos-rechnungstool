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
    <div className="space-y-2.5">
      <div>
        <Label className="text-xs text-muted-foreground">Name / Firma</Label>
        <Input
          value={debtor.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Firma GmbH"
          className="h-9"
        />
        {errors?.['debtor.name'] && (
          <p className="text-xs text-destructive mt-0.5">{errors['debtor.name']}</p>
        )}
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Strasse</Label>
        <Input
          value={debtor.street}
          onChange={(e) => update('street', e.target.value)}
          placeholder="Musterstrasse 1"
          className="h-9"
        />
        {errors?.['debtor.street'] && (
          <p className="text-xs text-destructive mt-0.5">{errors['debtor.street']}</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">PLZ</Label>
          <Input
            value={debtor.zip}
            onChange={(e) => update('zip', e.target.value)}
            placeholder="8000"
            className="h-9"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Ort</Label>
          <Input
            value={debtor.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Zuerich"
            className="h-9"
          />
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Land</Label>
        <Input
          value={debtor.country}
          onChange={(e) => update('country', e.target.value)}
          placeholder="CH"
          className="h-9 w-24"
        />
      </div>
    </div>
  )
}
