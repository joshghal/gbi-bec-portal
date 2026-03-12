'use client';

import { useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { AdminFormTable } from '@/components/admin-form-table';
import { AdminTabs } from '@/components/admin-tabs';
import { FormDateManager } from '@/components/form-date-manager';
import { FormReport } from '@/components/form-report';
import { RequirePermission } from '@/components/require-permission';
import { Button } from '@/components/ui/button';

type Tab = 'submissions' | 'dates' | 'report';

export default function AdminBaptismPage() {
  const [tab, setTab] = useState<Tab>('submissions');
  const [exportFn, setExportFn] = useState<(() => void) | null>(null);

  const handleExportReady = useCallback((fn: (() => void) | null) => {
    setExportFn(() => fn);
  }, []);

  return (
    <RequirePermission permission="page:forms/baptism">
      <div className="flex flex-col flex-1 min-h-0">
        <header className="border-b bg-card px-6 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-lg">Baptisan</h1>
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
              { id: 'dates' as Tab, label: 'Tanggal Baptisan' },
              { id: 'report' as Tab, label: 'Laporan' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </header>

        {tab === 'submissions' && (
          <AdminFormTable formType="baptism" title="Baptisan" />
        )}
        {tab === 'dates' && (
          <FormDateManager formType="baptism" dateLabel="Tanggal Baptisan Tersedia" />
        )}
        {tab === 'report' && (
          <FormReport
            formType="baptism"
            title="Baptisan"
            exportFileName="Laporan-Baptisan"
            onExportReady={handleExportReady}
          />
        )}
      </div>
    </RequirePermission>
  );
}
