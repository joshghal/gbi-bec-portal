import { NextRequest } from 'next/server';
import { getAdminFirestore, getVerifiedEmail } from '@/lib/firebase-admin';

export type AdminAction = 'create' | 'update' | 'delete';

interface LogDetails {
  resourceId?: string;
  resourceTitle?: string;
}

/**
 * Fire-and-forget — call after a successful write, never awaited.
 * Silently swallows errors so logging never breaks the actual operation.
 */
export function logAdminAction(
  request: NextRequest,
  action: AdminAction,
  resource: string,
  details?: LogDetails,
): void {
  (async () => {
    try {
      const adminEmail = await getVerifiedEmail(request);
      if (!adminEmail) return;

      const db = getAdminFirestore();
      await db.collection('admin_logs').add({
        adminEmail,
        action,
        resource,
        resourceId: details?.resourceId ?? null,
        resourceTitle: details?.resourceTitle ?? null,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // intentionally silent
    }
  })();
}
