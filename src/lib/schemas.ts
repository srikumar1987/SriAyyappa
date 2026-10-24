import { z } from 'zod';

export const PAYMENTS = ['cash', 'upi', 'whatsapp', 'bank'] as const;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const lotSchema = z.object({
  productId: z.string().min(1).max(20),
  supplier: z.string().trim().min(1).max(80),
  receivedOn: isoDate,
  qtyReceived: z.coerce.number().int().positive().max(100000),
  buyPriceUnit: z.coerce.number().nonnegative().max(1000000),
  sellingPriceUnit: z.coerce.number().nonnegative().max(1000000),
  lotExpensesTotal: z.coerce.number().nonnegative().max(10000000).default(0),
  expenseNote: z.string().trim().max(200).default(''),
});

export const saleSchema = z.object({
  productId: z.string().min(1).max(20),
  qty: z.coerce.number().int().positive().max(100000),
  unitPrice: z.coerce.number().nonnegative().max(1000000),
  payment: z.enum(PAYMENTS),
  customerName: z.string().trim().max(80).default(''),
  customerPhone: z.string().trim().regex(/^[0-9+ ]{0,15}$/).default(''),
});
