'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Shield,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { RequirePermission } from '@/components/require-permission';
import { AdminTabs } from '@/components/admin-tabs';
import { ALL_PERMISSIONS, type Role, type AdminUser } from '@/lib/permissions';

type Tab = 'users' | 'roles';

// ──────────────────────── Role Editor ────────────────────────

function RoleEditor({
  initial,
  roleKey,
  onSave,
  onCancel,
  saving,
  isSuperAdmin,
}: {
  initial: Role | null;
  roleKey: string;
  onSave: (key: string, role: Role) => void;
  onCancel: () => void;
  saving: boolean;
  isSuperAdmin: boolean;
}) {
  const [key, setKey] = useState(roleKey);
  const [label, setLabel] = useState(initial?.label || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [perms, setPerms] = useState<Set<string>>(new Set(initial?.permissions || []));
  const [isWildcard, setIsWildcard] = useState(initial?.permissions.includes('*') || false);

  const isEdit = !!initial;

  const togglePerm = (id: string) => {
    const next = new Set(perms);
    if (next.has(id)) {
      // remove both full and :read
      next.delete(id);
      next.delete(id + ':read');
    } else {
      next.add(id);
    }
    setPerms(next);
  };

  const toggleReadOnly = (id: string) => {
    const next = new Set(perms);
    if (next.has(id)) {
      // downgrade full → read-only
      next.delete(id);
      next.add(id + ':read');
    } else if (next.has(id + ':read')) {
      // upgrade read-only → full
      next.delete(id + ':read');
      next.add(id);
    }
    setPerms(next);
  };

  const handleSave = () => {
    if (!key || !label) return;
    const permissions = isWildcard ? ['*'] : Array.from(perms);
    onSave(key, { label, description, permissions, isSystem: initial?.isSystem || false });
  };

  return (
    <div className="border rounded-lg p-5 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{isEdit ? 'Edit Peran' : 'Tambah Peran Baru'}</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>ID Peran</Label>
          <Input
            value={key}
            onChange={e => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
            disabled={isEdit}
            placeholder="custom_role"
            className="mt-1 font-mono text-sm"
          />
        </div>
        <div>
          <Label>Nama</Label>
          <Input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Nama Peran"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Deskripsi</Label>
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Deskripsi singkat"
          className="mt-1"
        />
      </div>

      {/* Wildcard toggle — only visible to super admins */}
      {isSuperAdmin && (
        <div className="flex items-center gap-3 border rounded-md px-3 py-2">
          <button
            type="button"
            onClick={() => setIsWildcard(!isWildcard)}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              isWildcard ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
            }`}
          >
            {isWildcard && <span className="text-[10px] font-bold">✓</span>}
          </button>
          <div>
            <p className="text-sm font-medium">Akses Penuh (*)</p>
            <p className="text-xs text-muted-foreground">Semua halaman, termasuk yang baru ditambahkan</p>
          </div>
        </div>
      )}

      {/* Permission checkboxes */}
      {!isWildcard && (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Halaman</Label>
          <div className="border rounded-md divide-y">
            {ALL_PERMISSIONS.map(p => {
              const hasFull = perms.has(p.id);
              const hasRead = perms.has(p.id + ':read');
              const active = hasFull || hasRead;

              return (
                <div key={p.id} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => togglePerm(p.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        active ? 'bg-primary border-primary text-primary-foreground' : 'border-input'
                      }`}
                    >
                      {active && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                    <span className="text-sm">{p.label}</span>
                  </div>
                  {active && (
                    <button
                      type="button"
                      onClick={() => toggleReadOnly(p.id)}
                      className="text-[10px] font-medium px-2 py-0.5 rounded border transition-colors hover:bg-accent"
                    >
                      {hasFull ? 'Penuh' : 'Baca saja'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Batal</Button>
        <Button onClick={handleSave} disabled={saving || !key || !label}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
          Simpan
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────── Main Page ────────────────────────

export default function AdminUsersPage() {
  const { user, isSuperAdmin, refreshPermissions } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<Record<string, AdminUser>>({});
  const [roles, setRoles] = useState<Record<string, Role>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User dialogs
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  // Role editor
  const [editingRole, setEditingRole] = useState<{ key: string; role: Role | null } | null>(null);
  const [deleteRoleKey, setDeleteRoleKey] = useState<string | null>(null);
  const [roleError, setRoleError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.users || {});
      setRoles(data.roles || {});
    } catch (error) {
      console.error('Failed to fetch admin users:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── User handlers ──
  const handleAddUser = async () => {
    if (!newEmail || !newRole) return;
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail, name: newName, role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to add');
      setShowAdd(false);
      setNewEmail('');
      setNewName('');
      setNewRole('');
      await fetchData();
    } catch (error) {
      console.error('Add failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteEmail) return;
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: deleteEmail }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      setDeleteEmail(null);
      await fetchData();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (email: string, role: string) => {
    setSaving(true);
    try {
      const token = await user?.getIdToken();
      const existingUser = users[email];
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, name: existingUser?.name || '', role }),
      });
      if (!res.ok) throw new Error('Failed to update');
      await Promise.all([fetchData(), refreshPermissions()]);
    } catch (error) {
      console.error('Role update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // ── Role handlers ──
  const handleSaveRole = async (key: string, role: Role) => {
    setSaving(true);
    setRoleError('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, role }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      setEditingRole(null);
      await Promise.all([fetchData(), refreshPermissions()]);
    } catch (error) {
      setRoleError(error instanceof Error ? error.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleKey) return;
    setSaving(true);
    setRoleError('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/roles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key: deleteRoleKey }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      setDeleteRoleKey(null);
      await Promise.all([fetchData(), refreshPermissions()]);
    } catch (error) {
      setRoleError(error instanceof Error ? error.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  const userEntries = Object.entries(users);
  // Non-super-admins can't see or assign super_admin role
  const assignableRoles = Object.entries(roles).filter(
    ([key, role]) => isSuperAdmin || (key !== 'super_admin' && !role.permissions.includes('*'))
  );

  return (
    <RequirePermission permission="page:admin-users">
      <div className="min-h-0 flex-1">
        <header className="border-b bg-card px-6 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">Kelola Admin</h1>
              <p className="text-xs text-muted-foreground">
                Atur pengguna dan peran admin
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {tab === 'users' && (
                <Button onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Admin
                </Button>
              )}
              {tab === 'roles' && (
                <Button onClick={() => setEditingRole({ key: '', role: null })}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Peran
                </Button>
              )}
            </div>
          </div>

          <AdminTabs
            tabs={[
              { id: 'users' as Tab, label: 'Pengguna', count: userEntries.length },
              { id: 'roles' as Tab, label: 'Peran', count: Object.keys(roles).length },
            ]}
            active={tab}
            onChange={setTab}
          />
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Memuat...
            </div>
          ) : tab === 'users' ? (
            /* ──────── Users Tab ──────── */
            userEntries.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">Belum ada admin.</div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="w-[180px]">Peran</TableHead>
                      <TableHead className="w-[60px] text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userEntries.map(([email, adminUser]) => (
                      <TableRow key={email}>
                        <TableCell className="font-medium text-sm">{adminUser.name || '-'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{email}</TableCell>
                        <TableCell>
                          <SearchableSelect
                            options={assignableRoles.map(([key]) => key)}
                            value={adminUser.role}
                            onChange={v => v && handleRoleChange(email, v)}
                            disabled={saving || (!isSuperAdmin && adminUser.role === 'super_admin')}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {(isSuperAdmin || adminUser.role !== 'super_admin') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteEmail(email)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            /* ──────── Roles Tab ──────── */
            <div className="space-y-4">
              {roleError && (
                <p className="text-sm text-destructive">{roleError}</p>
              )}

              {editingRole && (
                <RoleEditor
                  initial={editingRole.role}
                  roleKey={editingRole.key}
                  onSave={handleSaveRole}
                  onCancel={() => { setEditingRole(null); setRoleError(''); }}
                  saving={saving}
                  isSuperAdmin={isSuperAdmin}
                />
              )}

              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(roles).map(([key, role]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="font-medium text-sm">{role.label}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {role.isSystem && (
                          <Badge variant="outline" className="text-[10px]">Sistem</Badge>
                        )}
                        {(isSuperAdmin || (key !== 'super_admin' && !role.permissions.includes('*'))) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditingRole({ key, role })}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                        {!role.isSystem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteRoleKey(key)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {role.permissions.map(p => (
                        <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono">{key}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Add User Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Admin Baru</DialogTitle>
              <DialogDescription>Masukkan email Google dan pilih peran.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-email">Email</Label>
                <Input id="add-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@gmail.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="add-name">Nama</Label>
                <Input id="add-name" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama lengkap" className="mt-1" />
              </div>
              <div className="space-y-1.5">
                <Label>Peran</Label>
                <SearchableSelect
                  options={assignableRoles.map(([key]) => key)}
                  value={newRole}
                  onChange={v => setNewRole(v)}
                  placeholder="Pilih peran"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleAddUser} disabled={saving || !newEmail || !newRole}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
                Tambah
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={!!deleteEmail} onOpenChange={open => !open && setDeleteEmail(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Admin?</DialogTitle>
              <DialogDescription>
                <strong className="text-foreground">{deleteEmail}</strong> akan kehilangan akses admin.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteEmail(null)}>Batal</Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Role Dialog */}
        <Dialog open={!!deleteRoleKey} onOpenChange={open => !open && setDeleteRoleKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Peran?</DialogTitle>
              <DialogDescription>
                Peran <strong className="text-foreground">{deleteRoleKey && roles[deleteRoleKey]?.label}</strong> akan dihapus permanen.
              </DialogDescription>
            </DialogHeader>
            {roleError && <p className="text-sm text-destructive">{roleError}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteRoleKey(null); setRoleError(''); }}>Batal</Button>
              <Button variant="destructive" onClick={handleDeleteRole} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Trash2 className="w-4 h-4 mr-1.5" />}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequirePermission>
  );
}
