import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceStatus } from '@/types';

const statusOptions: { value: InvoiceStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PAID', label: 'Paid' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'VOID', label: 'Void' },
];

const limitOptions = [10, 25, 50, 100];

interface InvoiceFiltersProps {
  search: string;
  status: InvoiceStatus | 'ALL';
  limit: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: InvoiceStatus | 'ALL') => void;
  onLimitChange: (value: number) => void;
  extraFilters?: ReactNode;
}

export const InvoiceFilters = ({
  search,
  status,
  limit,
  onSearchChange,
  onStatusChange,
  onLimitChange,
  extraFilters,
}: InvoiceFiltersProps) => {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Input
          id="invoice-search"
          value={search}
          placeholder="Search by project, description, or email..."
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={status} onValueChange={(value) => onStatusChange(value as InvoiceStatus | 'ALL')}>
          <SelectTrigger className="h-10 w-[250px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={limit.toString()} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger className="h-10 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {limitOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {extraFilters && <div className="text-sm">{extraFilters}</div>}
    </div>
  );
};
