import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/components/shared/Toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function MyTrades() {
  const [trades, setTrades] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const { addToast } = useToast();

  useEffect(() => {
    fetchTrades(1);
  }, []);

  // Real-time trade updates
  useEffect(() => {
    if (!socket) return;

    function handleCopied(data) {
      addToast({
        title: 'Trade Copied',
        description: `${data.action} ${data.qty} ${data.symbol} — ${data.status}`,
        variant: 'success',
      });
      fetchTrades(pagination.page);
    }

    function handleFailed(data) {
      addToast({
        title: 'Trade Failed',
        description: `${data.symbol} — ${data.error}`,
        variant: 'destructive',
      });
      fetchTrades(pagination.page);
    }

    socket.on('trade:copied', handleCopied);
    socket.on('trade:failed', handleFailed);

    return () => {
      socket.off('trade:copied', handleCopied);
      socket.off('trade:failed', handleFailed);
    };
  }, [socket, pagination.page]);

  async function fetchTrades(page) {
    try {
      setLoading(true);
      const { data } = await api.get(`/user/trades?page=${page}&limit=20`);
      setTrades(data.trades);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load trades:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && trades.length === 0) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Copied Trades</h2>
        <span className="text-muted-foreground">{pagination.total} total</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Analyst</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No copied trades yet
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => {
                const signal = trade.tradeSignalId;
                return (
                  <TableRow key={trade._id}>
                    <TableCell className="font-medium">{signal?.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={signal?.action === 'BUY' ? 'success' : 'destructive'}>
                        {signal?.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{signal?.quantity}</TableCell>
                    <TableCell>{signal?.orderType}</TableCell>
                    <TableCell className="text-sm">
                      {signal?.analystId?.userId?.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {trade.filledPrice ? `$${trade.filledPrice.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trade.status === 'FILLED' ? 'success' :
                          trade.status === 'FAILED' ? 'destructive' : 'warning'
                        }
                      >
                        {trade.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(trade.executedAt || trade.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchTrades(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchTrades(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
