import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { InvoiceFilters } from '@/components/billing/InvoiceFilters';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { formatInvoiceAmount } from '@/components/billing/invoice-utils';
import { InvoiceListQueryParams, InvoiceStatus, BillingInvoice } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useInvoices, invoiceKeys } from '@/hooks/use-invoices';
import { useInvoicePdf } from '@/hooks/use-invoice-pdf';
import { markInvoicePaid } from '@/services/billingService';
import { useToast } from '@/components/ui/use-toast';

interface BillingOperationsViewProps {
  title: string;
  description: string;
  defaultStatus?: InvoiceStatus | 'ALL';
}

export const BillingOperationsView = ({ title, description, defaultStatus = 'OPEN' }: BillingOperationsViewProps) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | 'ALL'>(defaultStatus);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { downloadingId, download } = useInvoicePdf();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    setPage(1);
  }, [status, limit, debouncedSearch]);

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

  const { data, isLoading, isFetching, isError, error } = useInvoices(queryParams);

  const invoices = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentStart = invoices.length ? (page - 1) * limit + 1 : 0;
  const currentEnd = (page - 1) * limit + invoices.length;

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        if (invoice.status === 'OPEN') {
          acc.openCount += 1;
          acc.openAmount += invoice.amountTotal;
        }
        if (invoice.status === 'PAID') {
          acc.paidThisPage += 1;
          acc.collectedThisPage += invoice.amountTotal;
        }
        return acc;
      },
      { openCount: 0, openAmount: 0, paidThisPage: 0, collectedThisPage: 0 }
    );
  }, [invoices]);

  const markPaidMutation = useMutation({
    mutationFn: markInvoicePaid,
    onSuccess: (updatedInvoice) => {
      const label = updatedInvoice.projectName ?? updatedInvoice.id;
      toast({
        title: 'Invoice marked as paid',
        description: `${label} is now recorded as PAID.`,
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (mutationError: unknown) => {
      toast({
        title: 'Unable to mark invoice paid',
        description: mutationError instanceof Error ? mutationError.message : 'Unknown error.',
        variant: 'destructive',
      });
    },
    onSettled: () => setMarkingId(null),
  });

  const handleMarkPaid = (invoice: BillingInvoice) => {
    setMarkingId(invoice.id);
    markPaidMutation.mutate(invoice.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: invoiceKeys.all })} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base">Operational overview</CardTitle>
            <CardDescription>Lean metrics scoped to your current filters.</CardDescription>
          </div>
          <span className="text-xs text-muted-foreground">Live sync</span>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SnapshotCard
              label="Invoices in queue"
              value={stats.openCount}
              helper={formatInvoiceAmount(stats.openAmount, invoices[0]?.currency || 'USD')}
            />
            <SnapshotCard
              label="Paid on this page"
              value={stats.paidThisPage}
              helper={formatInvoiceAmount(stats.collectedThisPage, invoices[0]?.currency || 'USD')}
            />
            <SnapshotCard label="Filtered results" value={total} helper="records in result set" />
            <div className="rounded-md border bg-muted/30 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Manual settlement ready</p>
              <div className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {stats.openCount}
              </div>
              <p className="text-xs text-muted-foreground leading-tight">Mark invoices as paid once funds clear.</p>
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
          renderActions={(invoice) =>
            invoice.status === 'OPEN' ? (
              <MarkPaidButton
                invoice={invoice}
                onConfirm={() => handleMarkPaid(invoice)}
                loading={markPaidMutation.isPending && markingId === invoice.id}
              />
            ) : null
          }
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
    </div>
  );
};

const EmployeeBilling = () => (
  <BillingOperationsView
    title="Billing Operations"
    description="Track invoices and record offline payments."
    defaultStatus="OPEN"
  />
);

const SnapshotCard = ({ label, value, helper }: { label: string; value: number; helper?: string }) => (
  <div className="rounded-md border bg-muted/30 px-3 py-2">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg font-semibold leading-tight">{value}</p>
    {helper && <p className="text-xs text-muted-foreground leading-tight">{helper}</p>}
  </div>
);

const MarkPaidButton = ({
  invoice,
  onConfirm,
  loading,
}: {
  invoice: BillingInvoice;
  onConfirm: () => void;
  loading: boolean;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" variant="outline" disabled={loading}>
        {loading ? 'Marking…' : 'Mark paid'}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Mark invoice as paid?</AlertDialogTitle>
        <AlertDialogDescription>
          This will move <span className="font-medium">{invoice.projectName ?? invoice.id}</span> to <strong>PAID</strong>{' '}
          status and emit downstream events. Only proceed if you have confirmed the funds were received.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="rounded-md bg-muted/50 p-3 text-sm">
        <p className="font-medium">{formatInvoiceAmount(invoice.amountTotal, invoice.currency)}</p>
        <p className="text-muted-foreground text-xs">
          Project ID: {invoice.projectId ?? 'N/A'} • Customer: {invoice.customerEmail ?? 'N/A'}
        </p>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={loading}>
          {loading ? 'Saving…' : 'Confirm'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const InvoiceTableSkeleton = () => (
  <div className="rounded-lg border bg-card p-4">
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="h-12 w-full animate-pulse rounded-md bg-muted/60" />
      ))}
    </div>
  </div>
);

export default EmployeeBilling;
