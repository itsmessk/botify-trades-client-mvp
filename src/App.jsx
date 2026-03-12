import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleGuard } from './routes/Guards';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';

// Analyst pages
import AnalystDashboard from './pages/analyst/AnalystDashboard';
import SignalForm from './pages/analyst/SignalForm';
import TradeHistory from './pages/analyst/TradeHistory';
import SubscribersList from './pages/analyst/SubscribersList';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import AnalystBrowse from './pages/user/AnalystBrowse';
import MyTrades from './pages/user/MyTrades';
import IBKRConnect from './pages/user/IBKRConnect';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TransactionsPage from './pages/admin/TransactionsPage';
import UsersPage from './pages/admin/UsersPage';

// SuperAdmin pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Analyst routes */}
      <Route
        path="/analyst"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['analyst']}>
              <Layout><AnalystDashboard /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/signal"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['analyst']}>
              <Layout><SignalForm /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/history"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['analyst']}>
              <Layout><TradeHistory /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyst/subscribers"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['analyst']}>
              <Layout><SubscribersList /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* User routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['user']}>
              <Layout><UserDashboard /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/analysts"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['user']}>
              <Layout><AnalystBrowse /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/trades"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['user']}>
              <Layout><MyTrades /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/connect"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['user']}>
              <Layout><IBKRConnect /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <Layout><TransactionsPage /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['admin']}>
              <Layout><UsersPage /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin routes */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['superadmin']}>
              <Layout><SuperAdminDashboard /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/transactions"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['superadmin']}>
              <Layout><TransactionsPage /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/users"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={['superadmin']}>
              <Layout><UsersPage /></Layout>
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
