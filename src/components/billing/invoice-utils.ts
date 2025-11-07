import { formatCurrency } from '@/lib/utils';

export const toMajorUnits = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return undefined;
  }
  return value / 100;
};

export const formatInvoiceAmount = (
  value: number | null | undefined,
  currency = 'USD',
  locale?: string,
  options?: Intl.NumberFormatOptions
) => formatCurrency(toMajorUnits(value) ?? null, currency, locale, options);
