import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
        <Label>Gesellschaft</Label>
        <Select
          value={companyId}
          onValueChange={(val) => {
            setCompanyId(val ?? '')
            onBrandChange('')
          }}
        >
          <SelectTrigger>
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
          <Label>Marke / Standort</Label>
          <Select
            value={brandId}
            onValueChange={(val) => onBrandChange(val ?? '')}
          >
            <SelectTrigger>
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
