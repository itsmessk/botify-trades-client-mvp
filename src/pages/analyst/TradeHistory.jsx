import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TradeHistory() {
  const [signals, setSignals] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignals(1);
  }, []);

  async function fetchSignals(page) {
    setLoading(true);
    try {
      const { data } = await api.get(`/analyst/signals?page=${page}&limit=20`);
      setSignals(data.signals);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load signals:', err);
    } finally {
      setLoading(false);
    }
  }

  const statusVariant = {
    FILLED: 'success',
    PENDING: 'warning',
    FAILED: 'destructive',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Trade History</h2>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No trade signals yet
                    </TableCell>
                  </TableRow>
                ) : (
                  signals.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">{s.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={s.action === 'BUY' ? 'success' : 'destructive'}>
                          {s.action}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.quantity}</TableCell>
                      <TableCell>{s.orderType}</TableCell>
                      <TableCell>{s.limitPrice ? `$${s.limitPrice}` : 'MKT'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[s.status]}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchSignals(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchSignals(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
