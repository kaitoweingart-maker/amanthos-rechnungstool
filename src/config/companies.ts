import type { Company, Brand } from '@/types/company'

export const companies: Company[] = [
  {
    id: 'amanthos-hotel',
    name: 'Amanthos Hotel AG',
    uid: 'CHE-188.410.975 MWST',
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
    uid: 'CHE-492.782.588 MWST',
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
    uid: 'CHE-163.870.674 MWST',
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
    logo: '/logos/prize-by-radisson.png',
  },
  {
    id: 'chs',
    label: 'Chalet Swiss',
    shortCode: 'CHS',
    companyId: 'amanthos-hotel',
    iban: 'CH390024824819893102N',
    logo: '/logos/chalet-swiss.png',
  },
  {
    id: 'hmu',
    label: 'Hotel Mulin',
    shortCode: 'HMU',
    companyId: 'amanthos-hotel',
    iban: 'CH390024824819893102N',
    logo: '/logos/hotel-mulin.png',
  },
  {
    id: 'alz',
    label: 'Amanthos Living Zuerich Airport',
    shortCode: 'ALZ',
    companyId: 'amanthos-living',
    iban: 'CH350024824819980202G',
    logo: '/logos/amanthos-living.png',
  },
  {
    id: 'als',
    label: 'Amanthos Living Solothurn',
    shortCode: 'ALS',
    companyId: 'amanthos-living',
    iban: 'CH350024824819980202G',
    logo: '/logos/amanthos-living.png',
  },
  {
    id: 'aln',
    label: 'Amanthos Living Nyon',
    shortCode: 'ALN',
    companyId: 'amanthos-living',
    iban: 'CH350024824819980202G',
    logo: '/logos/amanthos-living.png',
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
