/**
 * Enterprise date and fiscal period utilities.
 */

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatTimeOnly(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getFiscalQuarter(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed
  const q = Math.floor(month / 3) + 1;
  return `Q${q} ${date.getFullYear()}`;
}

export function isWithinDateRange(
  dateStr: string,
  range: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'
): boolean {
  if (range === 'all') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (range === 'today') {
    return d >= startOfDay;
  }

  if (range === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }

  if (range === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return d >= startOfMonth;
  }

  if (range === 'quarter') {
    const qStartMonth = Math.floor(now.getMonth() / 3) * 3;
    const startOfQuarter = new Date(now.getFullYear(), qStartMonth, 1);
    return d >= startOfQuarter;
  }

  if (range === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return d >= startOfYear;
  }

  return true;
}
