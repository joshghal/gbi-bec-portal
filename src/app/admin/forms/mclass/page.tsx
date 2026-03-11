'use client';

import { AdminFormTable } from '@/components/admin-form-table';
import { RequirePermission } from '@/components/require-permission';

export default function AdminMClassPage() {
  return (
    <RequirePermission permission="page:forms/mclass">
      <AdminFormTable formType="mclass" title="M-Class" />
    </RequirePermission>
  );
}
