'use client';

import { createContext, useContext } from 'react';
import type { LandingData } from '@/lib/landing-data';

const LandingDataContext = createContext<LandingData | null>(null);

export function useLandingData() {
  return useContext(LandingDataContext);
}

export default function LandingLoader({
  data,
  children,
}: {
  data: LandingData;
  children: React.ReactNode;
}) {
  return (
    <LandingDataContext.Provider value={data}>
      {children}
    </LandingDataContext.Provider>
  );
}
