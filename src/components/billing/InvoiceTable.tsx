import { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BillingInvoice } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatInvoiceAmount } from './invoice-utils';

interface InvoiceTableProps {
  invoices: BillingInvoice[];
  onDownload?: (invoice: BillingInvoice) => void;
  downloadingId?: string | null;
  renderActions?: (invoice: BillingInvoice) => ReactNode;
}

export const InvoiceTable = ({ invoices, onDownload, downloadingId, renderActions }: InvoiceTableProps) => {
  if (!invoices.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">No invoices found</p>
        <p className="mt-1">Try adjusting your filters or search keywords.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead className="hidden md:table-cell">Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="w-[180px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const projectLabel = invoice.projectName ?? 'Untitled project';
            const projectDescription = invoice.projectDescription ?? `Invoice #${invoice.id.slice(0, 8)}`;

            return (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Tooltip delayDuration={150}>
                    <TooltipTrigger asChild>
                      <div className="max-w-[240px] cursor-default">
                        <div className="font-medium truncate">{projectLabel}</div>
                        <div className="text-xs text-muted-foreground truncate">{projectDescription}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs space-y-1">
                      <p className="text-sm font-semibold leading-tight">{projectLabel}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{projectDescription}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">{invoice.customerEmail ?? '—'}</div>
                </TableCell>
                <TableCell className="font-semibold">{formatInvoiceAmount(invoice.amountTotal, invoice.currency)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{formatDateTime(invoice.createdAt)}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {renderActions?.(invoice)}
                    {onDownload && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {downloadingId === invoice.id ? 'Preparing…' : 'Download'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
