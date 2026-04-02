/** Parse YYYY-MM-DD and format to Indonesian locale */
function parse(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** "16 Mar 2026" */
export function formatDate(dateStr: string): string {
  return parse(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "16 Maret 2026" */
export function formatDateLong(dateStr: string): string {
  return parse(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "Selasa, 16 Maret 2026" */
export function formatDateFull(dateStr: string): string {
  return parse(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
