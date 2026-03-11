'use client';

import { AdminFormTable } from '@/components/admin-form-table';
import { RequirePermission } from '@/components/require-permission';

export default function AdminChildDedicationPage() {
  return (
    <RequirePermission permission="page:forms/child-dedication">
      <AdminFormTable formType="child-dedication" title="Penyerahan Anak" />
    </RequirePermission>
  );
}
