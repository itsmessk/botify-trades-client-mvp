import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

export default function IBKRConnect() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [form, setForm] = useState({ apiKey: '', accountId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/user/ibkr-connect', form);
      await checkAuth(); // refresh user data
      navigate('/user');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect IBKR account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <CardTitle>Connect IBKR Account</CardTitle>
          </div>
          <CardDescription>
            Enter your Interactive Brokers Client Portal API credentials.
            Your API key will be encrypted with AES-256-GCM before storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="apiKey">IBKR API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="e.g. U1234567"
                value={form.accountId}
                onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
