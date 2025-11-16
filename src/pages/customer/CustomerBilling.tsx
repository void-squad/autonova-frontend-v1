import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { BillingInvoice, InvoiceListQueryParams, InvoiceStatus } from '@/types';
import { InvoiceFilters } from '@/components/billing/InvoiceFilters';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { useDebounce } from '@/hooks/use-debounce';
import { useInvoices, invoiceKeys } from '@/hooks/use-invoices';
import { formatInvoiceAmount } from '@/components/billing/invoice-utils';
import { useInvoicePdf } from '@/hooks/use-invoice-pdf';
import { PayInvoiceDialog } from '@/components/billing/PayInvoiceDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const CustomerBilling = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const debouncedSearch = useDebounce(search, 400);
  const { downloadingId, download } = useInvoicePdf();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, limit]);

  const queryParams = useMemo<InvoiceListQueryParams>(() => {
    const offset = (page - 1) * limit;
    const params: InvoiceListQueryParams = { limit, offset };

    if (status !== 'ALL') {
      params.status = status;
    }

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    return params;
  }, [page, limit, status, debouncedSearch]);

  const { data, isLoading, isFetching, isError, error, refetch } = useInvoices(queryParams);

  const invoices = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentStart = invoices.length ? (page - 1) * limit + 1 : 0;
  const currentEnd = (page - 1) * limit + invoices.length;
  const currency = invoices[0]?.currency || 'USD';

  const { openCount, paidCount, openAmount } = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        if (invoice.status === 'OPEN') {
          acc.openCount += 1;
          acc.openAmount += invoice.amountTotal;
        }
        if (invoice.status === 'PAID') {
          acc.paidCount += 1;
        }
        return acc;
      },
      { openCount: 0, paidCount: 0, openAmount: 0 }
    );
  }, [invoices]);

  const normalizedRole = (user?.role ?? '').toUpperCase();
  const canPay = normalizedRole === 'CUSTOMER';

  const handleStartPayment = useCallback((invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setPayDialogOpen(true);
  }, []);

  const handlePaymentCompleted = useCallback(
    (updated: BillingInvoice) => {
      setPayDialogOpen(false);
      setSelectedInvoice(null);
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    [queryClient]
  );

  const renderActions = useCallback(
    (invoice: BillingInvoice) =>
      canPay && invoice.status === 'OPEN' ? (
        <Button size="sm" onClick={() => handleStartPayment(invoice)}>
          Pay
        </Button>
      ) : null,
    [canPay, handleStartPayment]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Search, filter, and download your invoices.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Overview</CardTitle>
            <CardDescription>Compact metrics for the active filters.</CardDescription>
          </div>
          <span className="text-xs text-muted-foreground">Realtime snapshot</span>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total results</p>
              <p className="mt-1 text-xl font-semibold">{total}</p>
              <p className="text-xs text-muted-foreground">records match filters</p>
            </div>
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Open exposure</p>
              <p className="mt-1 text-xl font-semibold">{formatInvoiceAmount(openAmount, currency)}</p>
              <p className="text-xs text-muted-foreground">{openCount} open invoices</p>
            </div>
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Paid invoices</p>
              <p className="mt-1 text-xl font-semibold">{paidCount}</p>
              <p className="text-xs text-muted-foreground">marked as paid</p>
            </div>
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Page size</p>
              <p className="mt-1 text-xl font-semibold">{limit}</p>
              <p className="text-xs text-muted-foreground">results per page</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InvoiceFilters
          search={search}
          status={status}
          limit={limit}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onLimitChange={setLimit}
        />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load invoices</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Unknown error.'}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <InvoiceTableSkeleton />
      ) : (
        <InvoiceTable
          invoices={invoices}
          onDownload={download}
          downloadingId={downloadingId}
          renderActions={canPay ? renderActions : undefined}
        />
      )}

      <div className="flex flex-col items-start justify-between gap-4 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
        <p>
          Showing {currentStart}-{currentEnd} of {total} invoices
          {isFetching && !isLoading ? ' • Updating…' : ''}
        </p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) setPage((prev) => prev - 1);
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
            <PaginationItem>
              <div className="px-4 text-sm">
                Page {page} of {totalPages}
              </div>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page < totalPages) setPage((prev) => prev + 1);
                }}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      {canPay && (
        <PayInvoiceDialog
          invoice={selectedInvoice}
          open={payDialogOpen}
          onOpenChange={(open) => {
            setPayDialogOpen(open);
            if (!open) {
              setSelectedInvoice(null);
            }
          }}
          onPaymentCompleted={handlePaymentCompleted}
        />
      )}
    </div>
  );
};

const InvoiceTableSkeleton = () => (
  <div className="rounded-lg border bg-card p-4">
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
      ))}
    </div>
  </div>
);

export default CustomerBilling;
