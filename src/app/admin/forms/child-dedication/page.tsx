'use client';

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { AdminFormTable } from '@/components/admin-form-table';
import { AdminTabs } from '@/components/admin-tabs';
import { FormReport } from '@/components/form-report';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';

type Tab = 'submissions' | 'report';

export default function AdminChildDedicationPage() {
  const [tab, setTab] = useState<Tab>('submissions');
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);

  const handleExportReady = useCallback((fn: (() => void) | null) => {
    setExportFn(() => fn);
  }, []);

  return (
    <RequirePermission permission="page:forms/child-dedication">
      <div className="flex flex-col flex-1 min-h-0">
        <header className="border-b bg-card px-6 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">Penyerahan Anak</h1>
            {tab === 'report' && exportFn && (
              <Button variant="outline" size="sm" onClick={exportFn}>
                <Download className="w-4 h-4 mr-1.5" />
                Export Excel
              </Button>
            )}
          </div>
          <AdminTabs
            tabs={[
              { id: 'submissions' as Tab, label: 'Pendaftaran' },
              { id: 'report' as Tab, label: 'Laporan' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </header>

        {tab === 'submissions' && (
          <AdminFormTable formType="child-dedication" title="Penyerahan Anak" />
        )}
{tab === 'report' && (
          <FormReport
            formType="child-dedication"
            title="Penyerahan Anak"
            noColumnLabel="Nama Anak"
            exportFileName="Laporan-PenyerahanAnak"
            onExportReady={handleExportReady}
          />
        )}
      </div>
    </RequirePermission>
  );
}
