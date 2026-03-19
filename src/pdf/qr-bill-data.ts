import type { InvoiceData } from '@/types/invoice'
import type { Company, Brand } from '@/types/company'
import type { Data } from 'swissqrbill/types'

export function buildQrBillData(
  invoice: InvoiceData,
  company: Company,
  brand: Brand,
  totalGross: number,
): Data {
  return {
    currency: 'CHF',
    amount: Math.round(totalGross * 100) / 100,
    creditor: {
      name: company.name,
      address: company.address.street,
      zip: parseInt(company.address.zip, 10),
      city: company.address.city,
      account: brand.iban,
      country: 'CH',
    },
    debtor: {
      name: invoice.debtor.name,
      address: invoice.debtor.street,
      zip: parseInt(invoice.debtor.zip, 10),
      city: invoice.debtor.city,
      country: 'CH',
    },
    message: `Rechnung ${brand.invoiceLabel} ${invoice.invoiceNumber}`,
  }
}
