export interface Company {
  id: string
  name: string
  uid: string
  address: {
    street: string
    zip: string
    city: string
    country: string
  }
  bic: string
}

export interface Brand {
  id: string
  label: string
  shortCode: string
  companyId: string
  iban: string
}
