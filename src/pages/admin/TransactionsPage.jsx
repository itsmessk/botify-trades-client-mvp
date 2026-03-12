import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useSocket } from '@/context/SocketContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchTransactions(1);
  }, [statusFilter]);

  // Real-time highlights on new trade:update
  useEffect(() => {
    if (!socket) return;

    function handleUpdate(data) {
      // Refresh data and highlight the new transaction
      fetchTransactions(pagination.page);
      setHighlightedId(data.tradeId);
      setTimeout(() => setHighlightedId(null), 3000);
    }

    socket.on('trade:update', handleUpdate);
    return () => socket.off('trade:update', handleUpdate);
  }, [socket, pagination.page]);

  async function fetchTransactions(page) {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/transactions?${params}`);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FILLED">Filled</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{pagination.total} total</span>
      </div>

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
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow
                  key={t.id}
                  className={highlightedId === t.id ? 'bg-primary/10 transition-colors duration-1000' : ''}
                >
                  <TableCell className="text-sm">{t.user}</TableCell>
                  <TableCell className="text-sm">{t.analyst}</TableCell>
                  <TableCell className="font-medium">{t.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={t.action === 'BUY' ? 'success' : 'destructive'}>
                      {t.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>{t.price ? `$${t.price.toFixed(2)}` : '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        t.status === 'FILLED' ? 'success' :
                        t.status === 'FAILED' ? 'destructive' : 'warning'
                      }
                    >
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(t.time).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchTransactions(pagination.page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchTransactions(pagination.page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
