import { useCallback, useState } from 'react';
import { BillingInvoice } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { downloadInvoicePdf } from '@/services/billingService';

export const useInvoicePdf = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const download = useCallback(
    async (invoice: BillingInvoice) => {
      setDownloadingId(invoice.id);
      try {
        const { blob, filename } = await downloadInvoicePdf(invoice.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Invoice download started',
          description: `Invoice ${invoice.projectName ?? invoice.id} will download shortly.`,
        });
      } catch (error) {
        toast({
          title: 'Unable to download invoice',
          description: error instanceof Error ? error.message : 'Something went wrong during the PDF download.',
          variant: 'destructive',
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [toast]
  );

  return { downloadingId, download };
};
