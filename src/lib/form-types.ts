export type FormType = 'kom' | 'baptism' | 'child-dedication' | 'prayer' | 'mclass';

export type FormFieldType = 'text' | 'textarea' | 'date' | 'tel' | 'email' | 'select';

export interface FormStep {
  field: string;
  /** Conversational question (used in chat UI) */
  question: string;
  /** Short label for direct form view */
  label?: string;
  type: FormFieldType;
  options?: string[];
  optional?: boolean;
  placeholder?: string;
  /** Fetch options from this URL instead of using static options[] */
  dynamicOptionsUrl?: string;
  /** Render at half width in 2-col grid (pairs with next half field) */
  half?: boolean;
  /** Hidden from public form — auto-generated server-side or pre-filled by defaultValue */
  hidden?: boolean;
  /** Pre-filled value — used when the field is hidden or to suggest a default */
  defaultValue?: string;
  /** Chained address select: which level of the Indonesian administrative hierarchy */
  chainType?: 'province' | 'regency' | 'district' | 'village';
  /** Field name of the parent in the chain (e.g., kecamatan's parent is kota) */
  chainParent?: string;
}

export interface FormSection {
  title: string;
  fields: string[];
}

export interface FormConfig {
  type: FormType;
  title: string;
  description: string;
  icon: string;
  steps: FormStep[];
  sections?: FormSection[];
  /** External registration URL — hides from built-in form flow */
  externalUrl?: string;
}

export interface FormSubmission {
  id: string;
  type: FormType;
  editToken: string;
  status: 'pending' | 'reviewed' | 'completed' | 'hadir' | 'tidak-hadir';
  data: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  searchTerms?: string[];
}
