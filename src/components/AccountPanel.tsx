import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { exportAllData, downloadJSON, downloadCSV, importBackup, type BackupPayload } from '@/lib/backup';
import { Download, Upload, LogOut, Cloud, FileJson, FileSpreadsheet, Loader2, User } from 'lucide-react';

export function AccountPanel() {
  const { user, signOut } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  async function handleExportJSON() {
    if (!user) return;
    setBusy('json'); setMsg(null);
    try {
      const data = await exportAllData(user.id);
      downloadJSON(data);
      setMsg('✅ Backup JSON baixado!');
    } catch (e) {
      setMsg(`❌ ${(e as Error).message}`);
    } finally { setBusy(null); }
  }

  async function handleExportCSV() {
    if (!user) return;
    setBusy('csv'); setMsg(null);
    try {
      const data = await exportAllData(user.id);
      downloadCSV(data);
      setMsg('✅ CSV baixado!');
    } catch (e) {
      setMsg(`❌ ${(e as Error).message}`);
    } finally { setBusy(null); }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setBusy('import'); setMsg(null);
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as BackupPayload;
      const res = await importBackup(payload, user.id);
      setMsg(res.ok ? `✅ ${res.details}` : `⚠️ ${res.details}`);
    } catch (err) {
      setMsg(`❌ Arquivo inválido: ${(err as Error).message}`);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      {/* Account */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <User size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Sua conta</h3>
        </div>
        <div className="text-xs text-muted-foreground mb-3 break-all">{user.email}</div>
        <div className="flex items-center gap-1 text-[10px] text-success mb-3">
          <Cloud size={10} /> Sincronizado na nuvem
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive font-bold py-2 rounded-lg text-xs"
        >
          <LogOut size={12} /> Sair
        </button>
      </div>

      {/* Backup */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Download size={14} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground">Backup & Exportação</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={handleExportJSON}
            disabled={busy !== null}
            className="flex items-center justify-center gap-1 bg-primary text-primary-foreground font-bold py-2 rounded-lg text-xs disabled:opacity-50"
          >
            {busy === 'json' ? <Loader2 className="animate-spin" size={12} /> : <FileJson size={12} />}
            JSON
          </button>
          <button
            onClick={handleExportCSV}
            disabled={busy !== null}
            className="flex items-center justify-center gap-1 bg-secondary text-secondary-foreground font-bold py-2 rounded-lg text-xs disabled:opacity-50"
          >
            {busy === 'csv' ? <Loader2 className="animate-spin" size={12} /> : <FileSpreadsheet size={12} />}
            CSV
          </button>
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="w-full flex items-center justify-center gap-1 bg-warning/20 text-warning font-bold py-2 rounded-lg text-xs disabled:opacity-50"
        >
          {busy === 'import' ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
          Importar JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={handleImport}
          className="hidden"
        />

        {msg && (
          <div className="mt-3 text-[11px] px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
