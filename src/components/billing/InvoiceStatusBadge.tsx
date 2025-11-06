import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/types';

const statusStyles: Record<InvoiceStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> =
  {
    DRAFT: { variant: 'outline', label: 'Draft' },
    OPEN: { variant: 'default', label: 'Open' },
    PAID: { variant: 'secondary', label: 'Paid' },
    VOID: { variant: 'destructive', label: 'Void' },
  };

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  const { variant, label } = statusStyles[status] ?? statusStyles.DRAFT;
  return <Badge variant={variant}>{label}</Badge>;
};
