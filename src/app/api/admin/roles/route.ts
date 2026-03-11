import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, getAdminFirestore, getRoles, invalidateRolesCache, getVerifiedEmail, getAdminUser } from '@/lib/firebase-admin';
import { hasPermission, type Role } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:admin-users');
  if (authError) return authError;

  const roles = await getRoles();
  return NextResponse.json({ roles });
}

/** Create or update a role */
export async function PUT(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:admin-users');
  if (authError) return authError;

  const body = await request.json();
  const { key, role } = body as { key: string; role: Role };

  if (!key || !role?.label || !role?.permissions) {
    return NextResponse.json({ error: 'key, role.label, and role.permissions required' }, { status: 400 });
  }

  // Only super_admin can edit super_admin role or assign wildcard permission
  if (key === 'super_admin' || role.permissions.includes('*')) {
    const reqEmail = await getVerifiedEmail(request);
    const reqUser = reqEmail ? await getAdminUser(reqEmail) : null;
    if (!reqUser || !hasPermission(reqUser.permissions, '*')) {
      return NextResponse.json({ error: 'Hanya Super Admin yang bisa mengedit peran ini' }, { status: 403 });
    }
  }

  const db = getAdminFirestore();
  const ref = db.collection('admins').doc('roles');
  const doc = await ref.get();
  const roles = (doc.exists ? doc.data()?.roles : {}) as Record<string, Role>;

  roles[key] = {
    label: role.label,
    description: role.description || '',
    permissions: role.permissions,
    isSystem: roles[key]?.isSystem || false,
  };

  await ref.set({ roles });
  invalidateRolesCache();

  return NextResponse.json({ success: true, role: roles[key] });
}

/** Delete a role (only non-system) */
export async function DELETE(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:admin-users');
  if (authError) return authError;

  const body = await request.json();
  const { key } = body as { key: string };

  if (!key) {
    return NextResponse.json({ error: 'key required' }, { status: 400 });
  }

  const db = getAdminFirestore();
  const ref = db.collection('admins').doc('roles');
  const doc = await ref.get();
  const roles = (doc.exists ? doc.data()?.roles : {}) as Record<string, Role>;

  if (!roles[key]) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  if (roles[key].isSystem) {
    return NextResponse.json({ error: 'Cannot delete system role' }, { status: 400 });
  }

  // Check if any user has this role
  const usersDoc = await db.collection('admins').doc('users').get();
  const users = (usersDoc.exists ? usersDoc.data()?.users : {}) as Record<string, { role: string }>;
  const usersWithRole = Object.entries(users).filter(([, u]) => u.role === key);
  if (usersWithRole.length > 0) {
    return NextResponse.json({
      error: `Role masih digunakan oleh ${usersWithRole.length} admin`,
    }, { status: 400 });
  }

  delete roles[key];
  await ref.set({ roles });
  invalidateRolesCache();

  return NextResponse.json({ success: true });
}
