'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface LandingData {
  updates: any[];
  updateSettings: { sectionEnabled: boolean };
  activities: any[];
  activitySettings: { sectionEnabled: boolean };
  announcement: any | null;
  formSettings: { disabledForms: string[] };
}

const LandingDataContext = createContext<LandingData | null>(null);

export function useLandingData() {
  return useContext(LandingDataContext);
}

export default function LandingLoader({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LandingData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/updates').then(r => r.ok ? r.json() : []),
      fetch('/api/updates/settings').then(r => r.ok ? r.json() : { sectionEnabled: true }),
      fetch('/api/activities').then(r => r.ok ? r.json() : []),
      fetch('/api/activities/settings').then(r => r.ok ? r.json() : { sectionEnabled: true }),
      fetch('/api/announcement').then(r => r.ok ? r.json() : null),
      fetch('/api/forms/settings').then(r => r.ok ? r.json() : { disabledForms: [] }),
    ]).then(([updates, updateSettings, activities, activitySettings, announcement, formSettings]) => {
      setData({ updates, updateSettings, activities, activitySettings, announcement, formSettings });
    }).catch(() => {
      // Fallback — show page with defaults
      setData({
        updates: [],
        updateSettings: { sectionEnabled: true },
        activities: [],
        activitySettings: { sectionEnabled: true },
        announcement: null,
        formSettings: { disabledForms: [] },
      });
    });
  }, []);

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium tracking-wide">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <LandingDataContext.Provider value={data}>
      {children}
    </LandingDataContext.Provider>
  );
}
