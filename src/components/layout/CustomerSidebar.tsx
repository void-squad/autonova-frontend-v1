import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  Wrench,
  TrendingUp,
  CreditCard,
  FileText,
  HelpCircle,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
  { name: 'Profile', href: '/profile', icon: UserCircle },
  { name: 'My Vehicles', href: '/customer/vehicles', icon: Car },
  {
    name: 'Book Appointment',
    href: '/customer/book-appointment',
    icon: Calendar,
  },
  { name: 'My Appointments', href: '/customer/appointments', icon: Calendar },
  { name: 'Modifications', href: '/customer/modifications', icon: Wrench },
  { name: 'Service Progress', href: '/customer/progress', icon: TrendingUp },
  { name: 'Billing', href: '/customer/billing', icon: CreditCard },
  { name: 'Reports', href: '/customer/reports', icon: FileText },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export default function CustomerSidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive =
          location.pathname === item.href ||
          location.pathname.startsWith(item.href + '/');
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
