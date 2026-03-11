'use client';

import { AdminFormTable } from '@/components/admin-form-table';
import { RequirePermission } from '@/components/require-permission';

export default function AdminKomPage() {
  return (
    <RequirePermission permission="page:forms/kom">
      <AdminFormTable formType="kom" title="KOM" />
    </RequirePermission>
  );
}
