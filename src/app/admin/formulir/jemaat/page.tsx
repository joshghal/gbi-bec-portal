'use client';

import { AdminFormTable } from '@/components/admin-form-table';
import { RequirePermission } from '@/components/require-permission';

export default function AdminMemberPage() {
  return (
    <RequirePermission permission="page:forms/member">
      <div className="flex flex-col flex-1 min-h-0">
        <header className="border-b bg-card px-6 py-4">
          <h1 className="font-semibold text-lg">Data Jemaat</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Jemaat baru yang mendaftar melalui formulir pendataan.
          </p>
        </header>

        <AdminFormTable formType="member" title="Data Jemaat" />
      </div>
    </RequirePermission>
  );
}
