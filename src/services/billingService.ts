import axios, { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import { BillingInvoice, InvoiceListQueryParams, InvoiceListResponse } from '@/types';
import { getAccessToken } from '@/lib/auth';

const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, '');
const ensureApiPrefix = (url: string) => {
  const normalized = sanitizeBaseUrl(url);
  return /\/api(\/|$)/i.test(normalized) ? normalized : `${normalized}/api`;
};

const BILLING_API_URL = (() => {
  const explicit = import.meta.env.VITE_BILLING_API_URL;
  if (explicit) return sanitizeBaseUrl(explicit);

  const gateway = import.meta.env.VITE_API_BASE_URL;
  const base = gateway ? ensureApiPrefix(gateway) : ensureApiPrefix('http://localhost:8080');

  return base;
})();

const billingClient = axios.create({
  baseURL: BILLING_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const toError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    const message = data?.error || data?.message || error.message || 'Billing request failed';
    return new Error(message);
  }

  return error instanceof Error ? error : new Error('Billing request failed');
};

const extractFilename = (headers?: RawAxiosResponseHeaders | AxiosResponseHeaders, id?: string) => {
  if (!headers) return id ? `invoice-${id}.pdf` : 'invoice.pdf';
  const disposition = headers['content-disposition'] as string | undefined;
  if (!disposition) return id ? `invoice-${id}.pdf` : 'invoice.pdf';

  const match = disposition.match(/filename="?(.+?)"?$/i);
  return match ? match[1] : id ? `invoice-${id}.pdf` : 'invoice.pdf';
};

export const listInvoices = async (params: InvoiceListQueryParams): Promise<InvoiceListResponse> => {
  try {
    const response = await billingClient.get<InvoiceListResponse>('/invoices', {
      params,
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

export const markInvoicePaid = async (id: string): Promise<BillingInvoice> => {
  try {
    const response = await billingClient.post<BillingInvoice>(`/invoices/${id}/mark-paid`, undefined, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    throw toError(error);
  }
};

export const downloadInvoicePdf = async (
  id: string
): Promise<{ blob: Blob; filename: string; headers?: RawAxiosResponseHeaders | AxiosResponseHeaders }> => {
  try {
    const response = await billingClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        ...authHeaders(),
        Accept: 'application/pdf',
      },
    });

    return {
      blob: response.data,
      filename: extractFilename(response.headers, id),
      headers: response.headers,
    };
  } catch (error) {
    throw toError(error);
  }
};
