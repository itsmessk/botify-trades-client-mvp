import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Users, Wifi } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTrades: 0, filledTrades: 0, subscriptions: 0 });
  const [ibkrConnected, setIbkrConnected] = useState(false);
  const [recentTrades, setRecentTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [tradesRes, analystsRes] = await Promise.all([
        api.get('/user/trades?limit=5'),
        api.get('/user/analysts'),
      ]);

      const trades = tradesRes.data.trades;
      const analysts = analystsRes.data.analysts;

      const filledCount = trades.filter((t) => t.status === 'FILLED').length;
      const subscribedCount = analysts.filter((a) => a.isSubscribed).length;

      setRecentTrades(trades);
      setStats({
        totalTrades: tradesRes.data.pagination.total,
        filledTrades: filledCount,
        subscriptions: subscribedCount,
      });
      setIbkrConnected(!!user?.ibkrAccountId);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {!ibkrConnected && (
        <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            You haven't connected your IBKR account yet.{' '}
            <Link to="/user/ibkr-connect" className="underline font-medium">Connect now</Link> to start copy trading.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTrades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled Trades</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.filledTrades}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.subscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IBKR Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={ibkrConnected ? 'success' : 'warning'}>
              {ibkrConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Copied Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades yet. Subscribe to an analyst to get started.</p>
          ) : (
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div key={trade._id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={trade.tradeSignalId?.action === 'BUY' ? 'success' : 'destructive'}>
                      {trade.tradeSignalId?.action}
                    </Badge>
                    <span className="font-medium">{trade.tradeSignalId?.symbol}</span>
                    <span className="text-sm text-muted-foreground">
                      Qty: {trade.tradeSignalId?.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {trade.filledPrice && (
                      <span className="text-sm">${trade.filledPrice.toFixed(2)}</span>
                    )}
                    <Badge variant={trade.status === 'FILLED' ? 'success' : trade.status === 'FAILED' ? 'destructive' : 'warning'}>
                      {trade.status}
                    </Badge>
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
