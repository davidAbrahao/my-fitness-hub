/**
 * Fila offline simples para retry de escritas no Supabase.
 *
 * - enqueue(op): salva no localStorage + tenta executar. Se falhar, fica na fila.
 * - flush(): tenta drenar a fila (chamado no boot e quando volta online).
 * - Mostra toast quando volta a sincronizar.
 */
import { supabase } from '@/integrations/supabase/client';
import { load, save } from './storage';
import { toast } from 'sonner';

type TableName = 'body_metrics' | 'habits_logs' | 'personal_records' | 'nutrition_logs' | 'workouts' | 'exercises_logs';

export interface QueuedOp {
  id: string;
  table: TableName;
  payload: Record<string, unknown> | Record<string, unknown>[];
  onConflict?: string;
  createdAt: number;
  retries: number;
}

const KEY = 'offline_queue_v1';
const MAX_RETRIES = 10;

function readQueue(): QueuedOp[] {
  return load<QueuedOp[]>(KEY, []);
}
function writeQueue(q: QueuedOp[]) {
  save(KEY, q);
}

async function execute(op: QueuedOp): Promise<{ ok: boolean; error?: string }> {
  try {
    const q = supabase.from(op.table as never);
    const builder = op.onConflict
      ? (q as never as { upsert: (p: unknown, o: { onConflict: string }) => Promise<{ error: { message: string } | null }> })
          .upsert(op.payload, { onConflict: op.onConflict })
      : (q as never as { insert: (p: unknown) => Promise<{ error: { message: string } | null }> }).insert(op.payload);
    const { error } = await builder;
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Adiciona à fila e tenta executar imediatamente. */
export async function enqueue(op: Omit<QueuedOp, 'id' | 'createdAt' | 'retries'>): Promise<void> {
  const queued: QueuedOp = {
    ...op,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    retries: 0,
  };
  const q = readQueue();
  q.push(queued);
  writeQueue(q);
  // Tenta drenar imediatamente
  void flush();
}

/** Tenta executar todas as operações pendentes. */
export async function flush(): Promise<{ done: number; pending: number }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { done: 0, pending: readQueue().length };
  }
  const q = readQueue();
  if (q.length === 0) return { done: 0, pending: 0 };

  const remaining: QueuedOp[] = [];
  let done = 0;
  for (const op of q) {
    const res = await execute(op);
    if (res.ok) {
      done++;
    } else {
      op.retries++;
      if (op.retries < MAX_RETRIES) remaining.push(op);
      else console.warn('Operação descartada após retries:', op, res.error);
    }
  }
  writeQueue(remaining);

  if (done > 0 && remaining.length === 0) {
    toast.success(`✅ ${done} alteração(ões) sincronizada(s)`);
  }
  return { done, pending: remaining.length };
}

export function pendingCount(): number {
  return readQueue().length;
}

/** Inicializa listeners (chame uma vez na boot). */
export function initOfflineQueue() {
  if (typeof window === 'undefined') return;
  // Drena ao iniciar
  void flush();
  // Drena ao voltar online
  window.addEventListener('online', () => {
    toast.info('Voltou a conexão — sincronizando…');
    void flush();
  });
  window.addEventListener('offline', () => {
    toast.warning('Sem conexão — alterações ficarão na fila');
  });
}
