import type { Company, Brand } from '@/types/company'

export const companies: Company[] = [
  {
    id: 'amanthos-hotel',
    name: 'Amanthos Hotel AG',
    uid: 'CHE-188.410.975',
    address: {
      street: 'Frueemattli 1',
      zip: '6404',
      city: 'Greppen',
      country: 'CH',
    },
    bic: 'UBSWCHZH80A',
  },
  {
    id: 'amanthos-living',
    name: 'Amanthos Living AG',
    uid: 'CHE-492.782.588',
    address: {
      street: 'Frueemattli 1',
      zip: '6404',
      city: 'Greppen',
      country: 'CH',
    },
    bic: 'UBSWCHZH80A',
  },
  {
    id: 'amanthos-ag',
    name: 'Amanthos AG',
    uid: 'CHE-163.870.674',
    address: {
      street: 'Frueemattli 1',
      zip: '6404',
      city: 'Greppen',
      country: 'CH',
    },
    bic: 'UBSWCHZH80A',
  },
]

export const brands: Brand[] = [
  {
    id: 'pbr',
    label: 'Prize by Radisson',
    shortCode: 'PBR',
    companyId: 'amanthos-hotel',
    iban: 'CH980024824819893101V',
  },
  {
    id: 'chs',
    label: 'Chalet Swiss',
    shortCode: 'CHS',
    companyId: 'amanthos-hotel',
    iban: 'CH390024824819893102N',
  },
  {
    id: 'hmu',
    label: 'Hotel Mulin',
    shortCode: 'HMU',
    companyId: 'amanthos-hotel',
    iban: 'CH390024824819893102N',
  },
  {
    id: 'alz',
    label: 'Living Zuerich',
    shortCode: 'ALZ',
    companyId: 'amanthos-living',
    iban: 'CH350024824819980202G',
  },
  {
    id: 'als',
    label: 'Living Solothurn',
    shortCode: 'ALS',
    companyId: 'amanthos-living',
    iban: 'CH350024824819980202G',
  },
  {
    id: 'aln',
    label: 'Living Nyon',
    shortCode: 'ALN',
    companyId: 'amanthos-living',
    iban: 'CH350024824819980202G',
  },
  {
    id: 'ama',
    label: 'Amanthos AG',
    shortCode: 'AMA',
    companyId: 'amanthos-ag',
    iban: 'CH910024824819993701R',
  },
]

export function getBrandsByCompany(companyId: string): Brand[] {
  return brands.filter((b) => b.companyId === companyId)
}

export function getBrandById(brandId: string): Brand | undefined {
  return brands.find((b) => b.id === brandId)
}

export function getCompanyById(companyId: string): Company | undefined {
  return companies.find((c) => c.id === companyId)
}

export function getCompanyForBrand(brandId: string): Company | undefined {
  const brand = getBrandById(brandId)
  if (!brand) return undefined
  return getCompanyById(brand.companyId)
}
