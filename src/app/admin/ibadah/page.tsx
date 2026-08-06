'use client';

import { useState } from 'react';
import { Presentation, Music, LayoutTemplate } from 'lucide-react';
import { RequirePermission } from '@/components/require-permission';
import { SetsTab } from './_components/sets-tab';
import { SongsTab } from './_components/songs-tab';
import { FixedSlidesTab } from './_components/fixed-slides-tab';

type Tab = 'sets' | 'songs' | 'fixed';

const TABS: { id: Tab; label: string; icon: typeof Presentation }[] = [
  { id: 'sets', label: 'Set Ibadah', icon: Presentation },
  { id: 'songs', label: 'Perpustakaan Lagu', icon: Music },
  { id: 'fixed', label: 'Slide Tetap', icon: LayoutTemplate },
];

export default function IbadahPage() {
  const [tab, setTab] = useState<Tab>('sets');

  return (
    <RequirePermission permission="page:ibadah">
      <div className="min-h-0 flex-1">
        {/* Header */}
        <header className="border-b bg-card px-6 pt-4">
          <div className="flex items-center gap-2.5 mb-3">
            <h1 className="font-semibold text-lg">Slide Ibadah</h1>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors ${
                  tab === id
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {tab === 'sets' && <SetsTab />}
          {tab === 'songs' && <SongsTab />}
          {tab === 'fixed' && <FixedSlidesTab />}
        </main>
      </div>
    </RequirePermission>
  );
}
