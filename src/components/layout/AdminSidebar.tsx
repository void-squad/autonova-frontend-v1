import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wrench,
  UserCog,
  CreditCard,
  Clock,
  BarChart3,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Employees', href: '/admin/employees', icon: UserCog },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Projects', href: '/admin/projects', icon: Wrench },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Time Logs', href: '/admin/time-logging', icon: Clock },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export default function AdminSidebar() {
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
