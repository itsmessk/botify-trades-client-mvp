import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3,
  Users,
  TrendingUp,
  LineChart,
  Settings,
  Plug,
  ListOrdered,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = {
  superadmin: [
    { to: '/superadmin', label: 'Dashboard', icon: BarChart3 },
    { to: '/superadmin/transactions', label: 'Transactions', icon: ListOrdered },
    { to: '/superadmin/users', label: 'Users', icon: Users },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/transactions', label: 'Transactions', icon: ListOrdered },
    { to: '/admin/users', label: 'Users', icon: Users },
  ],
  analyst: [
    { to: '/analyst', label: 'Dashboard', icon: BarChart3 },
    { to: '/analyst/signal', label: 'New Signal', icon: TrendingUp },
    { to: '/analyst/history', label: 'Trade History', icon: LineChart },
    { to: '/analyst/subscribers', label: 'Subscribers', icon: Users },
  ],
  user: [
    { to: '/user', label: 'Dashboard', icon: BarChart3 },
    { to: '/user/analysts', label: 'Browse Analysts', icon: UserPlus },
    { to: '/user/trades', label: 'My Trades', icon: ListOrdered },
    { to: '/user/connect', label: 'IBKR Connect', icon: Plug },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  const links = sidebarLinks[user.role] || [];

  return (
    <aside className="w-64 border-r bg-background min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === `/${user.role}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
