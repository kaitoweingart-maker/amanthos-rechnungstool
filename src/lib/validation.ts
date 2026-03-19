import { z } from 'zod'

export const debtorSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  street: z.string().min(1, 'Strasse ist erforderlich'),
  zip: z.string().min(4, 'PLZ ist erforderlich'),
  city: z.string().min(1, 'Ort ist erforderlich'),
  country: z.string().min(2, 'Land ist erforderlich').default('CH'),
})

export const positionSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Beschreibung ist erforderlich'),
  quantity: z.number().positive('Menge muss > 0 sein'),
  unitPrice: z.number().positive('Preis muss > 0 sein'),
  vatRate: z.union([z.literal(3.8), z.literal(8.1)]),
})

export const invoiceSchema = z.object({
  brandId: z.string().min(1, 'Marke ist erforderlich'),
  invoiceNumber: z.string().min(1, 'Rechnungsnummer ist erforderlich'),
  invoiceDate: z.string().min(1, 'Datum ist erforderlich'),
  paymentTermDays: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  debtor: debtorSchema,
  positions: z.array(positionSchema).min(1, 'Mindestens eine Position'),
  notes: z.string(),
})

export type InvoiceFormValues = z.infer<typeof invoiceSchema>
