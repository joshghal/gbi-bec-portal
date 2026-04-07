'use client';

import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

const config = getFormConfig('child-dedication')!;

export default function ChildDedicationFormPage() {
  return <FormDirect formConfig={config} />;
}
