import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const paths = {
    superadmin: '/superadmin',
    admin: '/admin',
    analyst: '/analyst',
    user: '/user',
  };

  return <Navigate to={paths[user.role] || '/login'} replace />;
}
