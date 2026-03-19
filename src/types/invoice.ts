export type VatRate = 3.8 | 8.1

export interface InvoicePosition {
  id: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: VatRate
}

export interface DebtorAddress {
  name: string
  street: string
  zip: string
  city: string
  country: string
}

export type PaymentTermDays = 7 | 14 | 30

export interface InvoiceData {
  brandId: string
  invoiceNumber: string
  invoiceDate: string
  paymentTermDays: PaymentTermDays
  debtor: DebtorAddress
  positions: InvoicePosition[]
  notes: string
}
