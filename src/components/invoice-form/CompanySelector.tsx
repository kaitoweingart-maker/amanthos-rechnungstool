import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { companies, getBrandsByCompany } from '@/config/companies'
import { useState } from 'react'

interface CompanySelectorProps {
  brandId: string
  onBrandChange: (brandId: string) => void
}

export function CompanySelector({ brandId, onBrandChange }: CompanySelectorProps) {
  const [companyId, setCompanyId] = useState<string>('')
  const availableBrands = companyId ? getBrandsByCompany(companyId) : []

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-primary">Gesellschaft *</label>
        <Select
          value={companyId}
          onValueChange={(val) => {
            setCompanyId(val ?? '')
            onBrandChange('')
          }}
        >
          <SelectTrigger className={!companyId ? 'border-primary/40 bg-primary/5' : ''}>
            <SelectValue placeholder="Gesellschaft waehlen..." />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {companyId && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-primary">Marke / Standort *</label>
          <Select
            value={brandId}
            onValueChange={(val) => onBrandChange(val ?? '')}
          >
            <SelectTrigger className={!brandId ? 'border-primary/40 bg-primary/5' : ''}>
              <SelectValue placeholder="Marke waehlen..." />
            </SelectTrigger>
            <SelectContent>
              {availableBrands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
