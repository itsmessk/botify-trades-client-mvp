import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/shared/Toast';

export default function SignalForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    symbol: '',
    action: 'BUY',
    quantity: '',
    orderType: 'MARKET',
    limitPrice: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        symbol: form.symbol.toUpperCase(),
        action: form.action,
        quantity: parseInt(form.quantity, 10),
        orderType: form.orderType,
        ...(form.orderType === 'LIMIT' ? { limitPrice: parseFloat(form.limitPrice) } : {}),
      };

      await api.post('/analyst/signal', payload);
      toast('Trade signal created and queued for copy trading!', 'success');
      navigate('/analyst/history');
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create signal', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Trade Signal</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g. AAPL"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Action</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={form.action === 'BUY' ? 'default' : 'outline'}
                  className={form.action === 'BUY' ? 'bg-green-600 hover:bg-green-700' : ''}
                  onClick={() => setForm({ ...form, action: 'BUY' })}
                >
                  BUY
                </Button>
                <Button
                  type="button"
                  variant={form.action === 'SELL' ? 'default' : 'outline'}
                  className={form.action === 'SELL' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => setForm({ ...form, action: 'SELL' })}
                >
                  SELL
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Number of shares"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={form.orderType} onValueChange={(val) => setForm({ ...form, orderType: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">Market</SelectItem>
                  <SelectItem value="LIMIT">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.orderType === 'LIMIT' && (
              <div className="space-y-2">
                <Label htmlFor="limitPrice">Limit Price</Label>
                <Input
                  id="limitPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Limit price"
                  value={form.limitPrice}
                  onChange={(e) => setForm({ ...form, limitPrice: e.target.value })}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending Signal...' : 'Send Trade Signal'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
