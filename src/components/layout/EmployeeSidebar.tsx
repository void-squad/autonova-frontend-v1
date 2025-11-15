import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Clock, FileText, HelpCircle, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
  { name: 'My Tasks', href: '/employee/tasks', icon: ClipboardList },
  { name: 'Time Logs', href: '/employee/time-logging', icon: Clock },
  { name: 'Billing', href: '/employee/billing', icon: CreditCard },
  { name: 'Reports', href: '/employee/reports', icon: FileText },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export default function EmployeeSidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-smooth',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
