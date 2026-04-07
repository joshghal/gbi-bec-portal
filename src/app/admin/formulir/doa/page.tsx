'use client';

import { AdminFormTable } from '@/components/admin-form-table';
import { RequirePermission } from '@/components/require-permission';

export default function AdminPrayerPage() {
  return (
    <RequirePermission permission="page:forms/prayer">
      <AdminFormTable formType="prayer" title="Pokok Doa" />
    </RequirePermission>
  );
}
