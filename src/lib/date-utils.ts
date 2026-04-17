// Date helpers — locked to America/Sao_Paulo to avoid UTC bugs.
// NEVER use toISOString() for "today" — it can shift the date when crossing midnight UTC.

const TZ = 'America/Sao_Paulo';

/** Returns YYYY-MM-DD for "today" in São Paulo timezone. */
export function todayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Returns YYYY-MM-DD for an arbitrary Date in São Paulo timezone. */
export function toLocalISO(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Returns YYYY-MM-DD for the most recent Monday (week start). */
export function weekStartISO(): string {
  const now = new Date();
  const localStr = now.toLocaleDateString('en-CA', { timeZone: TZ });
  const local = new Date(localStr + 'T12:00:00');
  const day = local.getDay();
  const diff = local.getDate() - day + (day === 0 ? -6 : 1);
  local.setDate(diff);
  return local.toLocaleDateString('en-CA', { timeZone: TZ });
}

/** Format a YYYY-MM-DD into pt-BR short (dd/mm). */
export function formatShortBR(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
