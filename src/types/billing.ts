export type InvoiceStatus = 'DRAFT' | 'OPEN' | 'PAID' | 'VOID';

export interface BillingInvoice {
  id: string;
  projectId: string;
  quoteId?: string | null;
  projectName?: string | null;
  projectDescription?: string | null;
  customerEmail: string;
  customerUserId: number;
  amountTotal: number;
  currency: string;
  paymentMethod?: 'Stripe' | 'Offline' | null;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListQueryParams {
  limit: number;
  offset: number;
  status?: InvoiceStatus;
  projectId?: string;
  search?: string;
}

export interface InvoiceListResponse {
  items: BillingInvoice[];
  total: number;
  limit: number;
  offset: number;
}
