import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PAYMENT_TERM_OPTIONS } from '@/config/constants'
import type { PaymentTermDays } from '@/types/invoice'

interface PaymentTermsProps {
  value: PaymentTermDays
  onChange: (days: PaymentTermDays) => void
}

export function PaymentTerms({ value, onChange }: PaymentTermsProps) {
  return (
    <div className="space-y-1.5">
      <Label>Zahlungsfrist</Label>
      <Select
        value={String(value)}
        onValueChange={(v) => { if (v) onChange(Number(v) as PaymentTermDays) }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAYMENT_TERM_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
