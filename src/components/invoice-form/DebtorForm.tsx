import { Input } from '@/components/ui/input'
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

  const hasError = (field: string) => !!errors?.[`debtor.${field}`]
  const isEmpty = (val: string) => !val.trim()

  return (
    <div className="space-y-2.5">
      <div>
        <label className={`text-xs font-medium ${isEmpty(debtor.name) ? 'text-primary' : 'text-muted-foreground'}`}>
          Name / Firma *
        </label>
        <Input
          value={debtor.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Firma GmbH"
          className={`h-9 ${isEmpty(debtor.name) ? 'border-primary/40 bg-primary/5' : ''} ${hasError('name') ? 'border-destructive' : ''}`}
        />
        {hasError('name') && (
          <p className="text-xs text-destructive mt-0.5">{errors!['debtor.name']}</p>
        )}
      </div>
      <div>
        <label className={`text-xs font-medium ${isEmpty(debtor.street) ? 'text-primary' : 'text-muted-foreground'}`}>
          Strasse *
        </label>
        <Input
          value={debtor.street}
          onChange={(e) => update('street', e.target.value)}
          placeholder="Musterstrasse 1"
          className={`h-9 ${isEmpty(debtor.street) ? 'border-primary/40 bg-primary/5' : ''} ${hasError('street') ? 'border-destructive' : ''}`}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={`text-xs font-medium ${isEmpty(debtor.zip) ? 'text-primary' : 'text-muted-foreground'}`}>
            PLZ *
          </label>
          <Input
            value={debtor.zip}
            onChange={(e) => update('zip', e.target.value)}
            placeholder="8000"
            className={`h-9 ${isEmpty(debtor.zip) ? 'border-primary/40 bg-primary/5' : ''}`}
          />
        </div>
        <div className="col-span-2">
          <label className={`text-xs font-medium ${isEmpty(debtor.city) ? 'text-primary' : 'text-muted-foreground'}`}>
            Ort *
          </label>
          <Input
            value={debtor.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Zuerich"
            className={`h-9 ${isEmpty(debtor.city) ? 'border-primary/40 bg-primary/5' : ''}`}
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Land</label>
        <Input
          value={debtor.country}
          disabled
          className="h-9 w-24 bg-muted text-muted-foreground cursor-not-allowed"
        />
      </div>
    </div>
  )
}
