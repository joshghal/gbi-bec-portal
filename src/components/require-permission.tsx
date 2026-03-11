'use client';

import { useAuth } from '@/hooks/useAuth';
import { ShieldX } from 'lucide-react';

export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission, isAdmin } = useAuth();

  if (!isAdmin) return null;

  // Check both full access and read-only
  if (!hasPermission(permission) && !hasPermission(permission + ':read')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <ShieldX className="w-10 h-10" />
        <p className="text-sm font-medium">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  return <>{children}</>;
}
