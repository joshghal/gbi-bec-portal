'use client';

import { getFormConfig } from '@/lib/form-config';
import { FormDirect } from '@/components/form-direct';

const config = getFormConfig('baptism')!;

export default function BaptismFormPage() {
  return <FormDirect formConfig={config} />;
}
