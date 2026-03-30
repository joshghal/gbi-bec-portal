import { toast } from 'sonner';

/**
 * Show a toast for common API error scenarios.
 * Call this in catch blocks or after failed responses.
 */
export function toastApiError(error: unknown, fallbackMessage = 'Terjadi kesalahan. Silakan coba lagi.') {
  const message = error instanceof Error ? error.message : fallbackMessage;

  if (message.includes('403') || message.includes('Forbidden')) {
    toast.error('Akses ditolak', { description: 'Anda tidak memiliki izin untuk aksi ini.' });
  } else if (message.includes('401') || message.includes('Unauthorized')) {
    toast.error('Sesi berakhir', { description: 'Silakan login kembali.' });
  } else if (message.includes('404') || message.includes('Not found')) {
    toast.error('Tidak ditemukan', { description: 'Data yang dicari tidak tersedia.' });
  } else if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    toast.error('Koneksi gagal', { description: 'Periksa koneksi internet Anda.' });
  } else {
    toast.error('Gagal', { description: message });
  }
}

/**
 * Wrapper for authenticated fetch that auto-toasts on error.
 * Returns the response if ok, throws with status info if not.
 */
export async function fetchWithToast(
  url: string,
  options?: RequestInit & { successMessage?: string }
): Promise<Response> {
  const { successMessage, ...fetchOptions } = options ?? {};

  try {
    const res = await fetch(url, fetchOptions);

    if (!res.ok) {
      const status = res.status;
      const body = await res.text().catch(() => '');
      throw new Error(body || `${status} ${res.statusText}`);
    }

    if (successMessage) {
      toast.success(successMessage);
    }

    return res;
  } catch (error) {
    toastApiError(error);
    throw error;
  }
}
