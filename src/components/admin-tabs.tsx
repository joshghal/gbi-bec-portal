'use client';

import { Badge } from '@/components/ui/badge';

interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface AdminTabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (tab: T) => void;
}

export function AdminTabs<T extends string>({ tabs, active, onChange }: AdminTabsProps<T>) {
  return (
    <div className="flex gap-1 mt-3">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-4 py-1.5 text-sm rounded-t-md transition-colors ${
            active === t.id
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50'
          }`}
        >
          {t.label}
          {t.count != null && (
            <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">{t.count}</Badge>
          )}
        </button>
      ))}
    </div>
  );
}
