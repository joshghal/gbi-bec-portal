export interface Role {
  label: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface AdminUser {
  role: string;
  name: string;
  addedAt: string;
  addedBy: string;
}

export const DEFAULT_ROLES: Record<string, Role> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Akses penuh ke semua halaman',
    permissions: ['*'],
    isSystem: true,
  },
  form_manager: {
    label: 'Pengelola Formulir',
    description: 'Mengelola semua formulir pendaftaran',
    permissions: [
      'page:forms/kom',
      'page:forms/baptism',
      'page:forms/child-dedication',
      'page:forms/prayer',
      'page:forms/mclass',
      'page:settings',
    ],
    isSystem: true,
  },
  content_editor: {
    label: 'Editor Konten',
    description: 'Mengelola basis pengetahuan chatbot',
    permissions: ['page:knowledge-base', 'page:kabar'],
    isSystem: true,
  },
  viewer: {
    label: 'Penonton',
    description: 'Hanya melihat data, tidak bisa mengubah',
    permissions: [
      'page:forms/kom:read',
      'page:forms/baptism:read',
      'page:forms/child-dedication:read',
      'page:forms/prayer:read',
      'page:forms/mclass:read',
      'page:analytics',
    ],
    isSystem: true,
  },
};

// Map route paths to required permissions
export const PAGE_PERMISSIONS: Record<string, string> = {
  '/admin': 'page:knowledge-base',
  '/admin/forms/kom': 'page:forms/kom',
  '/admin/forms/baptism': 'page:forms/baptism',
  '/admin/forms/child-dedication': 'page:forms/child-dedication',
  '/admin/forms/prayer': 'page:forms/prayer',
  '/admin/forms/mclass': 'page:forms/mclass',
  '/admin/settings': 'page:settings',
  '/admin/analytics': 'page:analytics',
  '/admin/posters': 'page:posters',
  '/admin/monitor': 'page:monitor',
  '/admin/chat-misses': 'page:chat-misses',
  '/admin/users': 'page:admin-users',
  '/admin/kabar': 'page:kabar',
};

// All assignable permissions with labels (for the role editor UI)
export const ALL_PERMISSIONS: { id: string; label: string }[] = [
  { id: 'page:knowledge-base', label: 'Basis Pengetahuan' },
  { id: 'page:posters', label: 'Poster' },
  { id: 'page:forms/kom', label: 'Formulir KOM' },
  { id: 'page:forms/baptism', label: 'Formulir Baptisan' },
  { id: 'page:forms/child-dedication', label: 'Formulir Penyerahan Anak' },
  { id: 'page:forms/prayer', label: 'Formulir Pokok Doa' },
  { id: 'page:forms/mclass', label: 'Formulir M-Class' },
  { id: 'page:settings', label: 'Pengaturan Formulir' },
  { id: 'page:analytics', label: 'Analitik' },
  { id: 'page:monitor', label: 'Monitor' },
  { id: 'page:chat-misses', label: 'Pertanyaan Tak Terjawab' },
  { id: 'page:admin-users', label: 'Kelola Admin' },
  { id: 'page:kabar', label: 'Kabar Terbaru' },
];

/**
 * Check if a user's permissions satisfy a required permission.
 * - `*` grants everything
 * - `page:X` implicitly grants `page:X:read`
 */
export function hasPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes('*')) return true;
  if (userPermissions.includes(required)) return true;
  // page:X:read is satisfied by page:X (full access implies read)
  if (required.endsWith(':read')) {
    const base = required.slice(0, -5); // strip ':read'
    if (userPermissions.includes(base)) return true;
  }
  return false;
}
