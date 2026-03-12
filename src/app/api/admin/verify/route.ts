import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedEmail, getAdminUser } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  const email = await getVerifiedEmail(request);
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminUser = await getAdminUser(email, true);
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    admin: true,
    role: adminUser.role,
    permissions: adminUser.permissions,
    isSuperAdmin: adminUser.permissions.includes('*'),
  });
}
