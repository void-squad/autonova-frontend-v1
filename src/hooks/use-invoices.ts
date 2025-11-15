import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listInvoices } from '@/services/billingService';
import { InvoiceListQueryParams } from '@/types';

const rootKey = ['invoices'] as const;

export const invoiceKeys = {
  all: rootKey,
  lists: () => [...rootKey, 'list'] as const,
  list: (params: InvoiceListQueryParams) => [...rootKey, 'list', params] as const,
  detail: (id: string) => [...rootKey, 'detail', id] as const,
};

export const useInvoices = (params: InvoiceListQueryParams) =>
  useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => listInvoices(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
  });
