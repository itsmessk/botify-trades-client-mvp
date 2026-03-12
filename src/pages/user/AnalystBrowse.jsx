import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, BarChart3 } from 'lucide-react';

export default function AnalystBrowse() {
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAnalysts();
  }, []);

  async function fetchAnalysts() {
    try {
      const { data } = await api.get('/user/analysts');
      setAnalysts(data.analysts);
    } catch (err) {
      console.error('Failed to load analysts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(analystId) {
    setActionLoading(analystId);
    try {
      await api.post(`/user/subscribe/${analystId}`);
      setAnalysts((prev) =>
        prev.map((a) =>
          a.id === analystId
            ? { ...a, isSubscribed: true, subscriberCount: a.subscriberCount + 1 }
            : a
        )
      );
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnsubscribe(analystId) {
    setActionLoading(analystId);
    try {
      await api.delete(`/user/unsubscribe/${analystId}`);
      setAnalysts((prev) =>
        prev.map((a) =>
          a.id === analystId
            ? { ...a, isSubscribed: false, subscriberCount: Math.max(0, a.subscriberCount - 1) }
            : a
        )
      );
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Browse Analysts</h2>

      {analysts.length === 0 ? (
        <p className="text-muted-foreground">No analysts available at the moment.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analysts.map((analyst) => (
            <Card key={analyst.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{analyst.email}</CardTitle>
                  {analyst.isSubscribed && <Badge variant="success">Subscribed</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyst.bio && (
                  <p className="text-sm text-muted-foreground">{analyst.bio}</p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{analyst.subscriberCount} subscribers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>{analyst.winRate?.toFixed(1) || 0}% win rate</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant={analyst.isSubscribed ? 'outline' : 'default'}
                  disabled={actionLoading === analyst.id}
                  onClick={() =>
                    analyst.isSubscribed
                      ? handleUnsubscribe(analyst.id)
                      : handleSubscribe(analyst.id)
                  }
                >
                  {actionLoading === analyst.id
                    ? 'Processing...'
                    : analyst.isSubscribed
                    ? 'Unsubscribe'
                    : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
