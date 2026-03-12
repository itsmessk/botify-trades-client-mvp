import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, BarChart3 } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardPath = {
    superadmin: '/superadmin',
    admin: '/admin',
    analyst: '/analyst',
    user: '/user',
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={user ? dashboardPath[user.role] : '/'} className="flex items-center gap-2 font-bold text-xl">
          <BarChart3 className="h-6 w-6" />
          BotifyTrade
        </Link>

        {user && (
          <>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email} ({user.role})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {mobileOpen && (
              <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 md:hidden z-50">
                <p className="text-sm text-muted-foreground mb-3">
                  {user.email} ({user.role})
                </p>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
