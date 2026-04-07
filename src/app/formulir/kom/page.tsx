'use client';

import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

const config = getFormConfig('kom')!;

export default function KomFormPage() {
  return <FormDirect formConfig={config} />;
}
