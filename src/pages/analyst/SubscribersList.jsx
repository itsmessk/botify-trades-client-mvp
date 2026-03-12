import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SubscribersList() {
  const [data, setData] = useState({ subscriberCount: 0, subscribers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  async function fetchSubscribers() {
    try {
      const { data } = await api.get('/analyst/subscribers');
      setData(data);
    } catch (err) {
      console.error('Failed to load subscribers:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscribers</h2>
        <span className="text-muted-foreground">{data.subscriberCount} total</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed Since</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No subscribers yet
                </TableCell>
              </TableRow>
            ) : (
              data.subscribers.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{new Date(sub.subscribedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
