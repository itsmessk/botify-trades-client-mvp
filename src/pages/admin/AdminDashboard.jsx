import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [transRes, usersRes] = await Promise.all([
        api.get('/admin/transactions?limit=5'),
        api.get('/admin/users?limit=1'),
      ]);
      setRecentTransactions(transRes.data.transactions);
      setUserCount(usersRes.data.pagination.total);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Links</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild size="sm"><Link to="/admin/transactions">Transactions</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/admin/users">Users</Link></Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button asChild variant="ghost" size="sm"><Link to="/admin/transactions">View all</Link></Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{t.symbol}</span>
                    <span className={t.action === 'BUY' ? 'text-green-600' : 'text-red-600'}>{t.action}</span>
                    <span className="text-muted-foreground">×{t.quantity}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{t.user}</span>
                    <span className={
                      t.status === 'FILLED' ? 'text-green-600' :
                      t.status === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                    }>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
