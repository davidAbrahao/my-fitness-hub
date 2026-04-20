/**
 * Cache local do último insight da IA (24h) para economizar créditos.
 */
import { load, save } from './storage';

const KEY = 'ai_insight_cache_v1';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export interface CachedInsight {
  content: string;
  generatedAt: string; // ISO
}

export function getCachedInsight(): CachedInsight | null {
  const c = load<CachedInsight | null>(KEY, null);
  if (!c) return null;
  const age = Date.now() - new Date(c.generatedAt).getTime();
  if (age > TTL_MS) return null;
  return c;
}

export function setCachedInsight(c: CachedInsight) {
  save(KEY, c);
}

export function clearCachedInsight() {
  save(KEY, null);
}

/** Tempo restante do cache em horas (arredondado p/ baixo). */
export function cacheRemainingHours(c: CachedInsight): number {
  const age = Date.now() - new Date(c.generatedAt).getTime();
  return Math.max(0, Math.floor((TTL_MS - age) / (60 * 60 * 1000)));
}
