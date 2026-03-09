export type FormType = 'kom' | 'baptism' | 'child-dedication' | 'prayer';

export type FormFieldType = 'text' | 'textarea' | 'date' | 'tel' | 'email' | 'select';

export interface FormStep {
  field: string;
  question: string;
  type: FormFieldType;
  options?: string[];
  optional?: boolean;
  placeholder?: string;
}

export interface FormConfig {
  type: FormType;
  title: string;
  description: string;
  icon: string;
  steps: FormStep[];
}

export interface FormSubmission {
  id: string;
  type: FormType;
  editToken: string;
  status: 'pending' | 'reviewed' | 'completed';
  data: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
