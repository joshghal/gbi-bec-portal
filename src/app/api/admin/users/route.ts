import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, getAdminFirestore, getRoles, getVerifiedEmail, getAdminUser } from '@/lib/firebase-admin';
import { hasPermission, type AdminUser } from '@/lib/permissions';
import { logAdminAction } from '@/lib/admin-logger';

export async function GET(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:admin-users');
  if (authError) return authError;

  const db = getAdminFirestore();
  const [usersDoc, roles] = await Promise.all([
    db.collection('admins').doc('users').get(),
    getRoles(),
  ]);

  const users = (usersDoc.exists ? usersDoc.data()?.users : {}) as Record<string, AdminUser>;

  return NextResponse.json({ users, roles });
}

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:admin-users');
  if (authError) return authError;

  const body = await request.json();
  const { email, name, role } = body as { email: string; name: string; role: string };

  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role required' }, { status: 400 });
  }

  // Verify role exists
  const roles = await getRoles();
  if (!roles[role]) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Only super_admin can assign super_admin role
  if (role === 'super_admin' || roles[role]?.permissions.includes('*')) {
    const reqEmail = await getVerifiedEmail(request);
    const reqUser = reqEmail ? await getAdminUser(reqEmail) : null;
    if (!reqUser || !hasPermission(reqUser.permissions, '*')) {
      return NextResponse.json({ error: 'Hanya Super Admin yang bisa menetapkan peran ini' }, { status: 403 });
    }
  }

  const db = getAdminFirestore();
  const ref = db.collection('admins').doc('users');
  const doc = await ref.get();
  const users = (doc.exists ? doc.data()?.users : {}) as Record<string, AdminUser>;

  users[email] = {
    role,
    name: name || email.split('@')[0],
    addedAt: new Date().toISOString(),
    addedBy: 'admin',
  };

  await ref.set({ users }, { merge: true });
  logAdminAction(request, 'create', 'admin-user', { resourceTitle: email });
  return NextResponse.json({ success: true, user: users[email] });
}

export async function DELETE(request: NextRequest) {
  const authError = await verifyAuthToken(request, 'page:admin-users');
  if (authError) return authError;

  const body = await request.json();
  const { email } = body as { email: string };

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const db = getAdminFirestore();
  const ref = db.collection('admins').doc('users');
  const doc = await ref.get();
  const users = (doc.exists ? doc.data()?.users : {}) as Record<string, AdminUser>;

  if (!users[email]) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  delete users[email];
  await ref.set({ users });
  logAdminAction(request, 'delete', 'admin-user', { resourceTitle: email });
  return NextResponse.json({ success: true });
}
