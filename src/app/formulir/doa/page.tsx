'use client';

import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

const config = getFormConfig('prayer')!;

export default function PrayerFormPage() {
  return <FormDirect formConfig={config} />;
}
