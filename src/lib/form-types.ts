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
  status: 'pending' | 'reviewed' | 'completed';
  data: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  searchTerms?: string[];
}
