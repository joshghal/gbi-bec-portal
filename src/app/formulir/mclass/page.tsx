'use client';

import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

const config = getFormConfig('mclass')!;

export default function MclassFormPage() {
  return <FormDirect formConfig={config} />;
}
