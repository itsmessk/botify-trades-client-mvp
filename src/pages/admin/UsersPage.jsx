import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  async function fetchUsers(page) {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (roleFilter) params.set('role', roleFilter);
      if (search.trim()) params.set('search', search.trim());
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      fetchUsers(1);
    }
  }

  async function toggleStatus(userId, currentStatus) {
    setToggling(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Management</h2>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={() => fetchUsers(1)}>Search</Button>

        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === 'ALL' ? '' : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="analyst">Analyst</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="superadmin">Super Admin</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">{pagination.total} total</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>IBKR</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'superadmin' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.ibkrAccountId ? 'success' : 'outline'}>
                      {user.ibkrAccountId || 'Not connected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleStatus(user._id, user.isActive)}
                        disabled={toggling === user._id || user.role === 'superadmin'}
                      />
                      <span className="text-xs text-muted-foreground">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => fetchUsers(pagination.page - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => fetchUsers(pagination.page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
