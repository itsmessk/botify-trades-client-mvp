import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import { useSocket } from '@/context/SocketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Activity, TrendingUp, BarChart3, CheckCircle, XCircle, Percent } from 'lucide-react';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txPagination, setTxPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [highlightedTx, setHighlightedTx] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  // Real-time trade updates
  useEffect(() => {
    if (!socket) return;
    function handleUpdate(data) {
      fetchTransactions(txPagination.page);
      setHighlightedTx(data.tradeId);
      setTimeout(() => setHighlightedTx(null), 3000);
    }
    socket.on('trade:update', handleUpdate);
    return () => socket.off('trade:update', handleUpdate);
  }, [socket, txPagination.page]);

  async function fetchAll() {
    try {
      const [statsRes, txRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/transactions?limit=10'),
        api.get('/admin/users?limit=10'),
      ]);
      setStats(statsRes.data.stats);
      setTransactions(txRes.data.transactions);
      setTxPagination(txRes.data.pagination);
      setUsers(usersRes.data.users);
      setUserPagination(usersRes.data.pagination);
    } catch (err) {
      console.error('Failed to load super admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions(page) {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/transactions?${params}`);
      setTransactions(data.transactions);
      setTxPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  }

  async function fetchUsers(page) {
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (roleFilter) params.set('role', roleFilter);
      if (userSearch.trim()) params.set('search', userSearch.trim());
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setUserPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }

  async function toggleStatus(userId, currentStatus) {
    setToggling(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
      // Refresh stats
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    } finally {
      setToggling(null);
    }
  }

  function exportCSV() {
    const headers = ['User', 'Analyst', 'Symbol', 'Action', 'Quantity', 'Price', 'Status', 'Time'];
    const rows = transactions.map((t) => [
      t.user, t.analyst, t.symbol, t.action, t.quantity,
      t.price || '', t.status, new Date(t.time).toISOString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>

      {/* Platform Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analysts</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalAnalysts}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalSubscriptions}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.successRate}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trade Signals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalSignals}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Copied Trades</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalCopiedTrades}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filled</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{stats.filledTrades}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{stats.failedTrades}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FILLED">Filled</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Analyst</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">No transactions</TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id} className={highlightedTx === t.id ? 'bg-primary/10 transition-colors duration-1000' : ''}>
                      <TableCell className="text-sm">{t.user}</TableCell>
                      <TableCell className="text-sm">{t.analyst}</TableCell>
                      <TableCell className="font-medium">{t.symbol}</TableCell>
                      <TableCell><Badge variant={t.action === 'BUY' ? 'success' : 'destructive'}>{t.action}</Badge></TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>{t.price ? `$${t.price.toFixed(2)}` : '—'}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'FILLED' ? 'success' : t.status === 'FAILED' ? 'destructive' : 'warning'}>{t.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(t.time).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {txPagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" size="sm" disabled={txPagination.page <= 1} onClick={() => fetchTransactions(txPagination.page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {txPagination.page} of {txPagination.pages}</span>
              <Button variant="outline" size="sm" disabled={txPagination.page >= txPagination.pages} onClick={() => fetchTransactions(txPagination.page + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                className="w-48"
              />
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === 'ALL' ? '' : v)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No users found</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'destructive'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => toggleStatus(user._id, user.isActive)}
                          disabled={toggling === user._id || user.role === 'superadmin'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {userPagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button variant="outline" size="sm" disabled={userPagination.page <= 1} onClick={() => fetchUsers(userPagination.page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {userPagination.page} of {userPagination.pages}</span>
              <Button variant="outline" size="sm" disabled={userPagination.page >= userPagination.pages} onClick={() => fetchUsers(userPagination.page + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
