/**
 * Indicador compacto de status de sincronização.
 * Estados: offline, syncing (N pendentes), saved-cloud, local-only (sem login).
 */
import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Loader2, HardDrive } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { pendingCount, flush } from '@/lib/offline-queue';

export function SyncStatus({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const refresh = () => setPending(pendingCount());
    refresh();
    const id = setInterval(refresh, 2000);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  async function forceSync() {
    if (!online || pending === 0) return;
    setSyncing(true);
    try {
      await flush();
      setPending(pendingCount());
    } finally {
      setSyncing(false);
    }
  }

  let icon = <Cloud size={compact ? 10 : 12} />;
  let label = 'Salvo';
  let color = 'text-success bg-success/10';

  if (!user) {
    icon = <HardDrive size={compact ? 10 : 12} />;
    label = 'Local';
    color = 'text-muted-foreground bg-muted';
  } else if (!online) {
    icon = <CloudOff size={compact ? 10 : 12} />;
    label = 'Offline';
    color = 'text-warning bg-warning/10';
  } else if (syncing || pending > 0) {
    icon = <Loader2 size={compact ? 10 : 12} className="animate-spin" />;
    label = pending > 0 ? `Sincronizando ${pending}` : 'Sincronizando';
    color = 'text-primary bg-primary/10';
  }

  return (
    <button
      onClick={forceSync}
      disabled={!online || pending === 0}
      className={`flex items-center gap-1 rounded-full font-bold transition-all ${color} ${
        compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'
      } ${pending > 0 && online ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
