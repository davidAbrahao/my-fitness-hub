import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) return <LoginScreen />;
  return <>{children}</>;
}

function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, displayName || undefined);
    setLoading(false);
    if (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha inválidos' : err.message);
    } else if (mode === 'signup') {
      setError('✅ Conta criada! Verifique seu email para confirmar (ou tente fazer login).');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🔥</div>
          <h1 className="text-3xl font-black text-primary neon-text mb-1">BARRIGA ZERO</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            {mode === 'signin' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-5 space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Como prefere ser chamado?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-transparent focus:border-primary focus:outline-none"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-transparent focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="w-full bg-secondary text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 text-sm border border-transparent focus:border-primary focus:outline-none"
          />

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg bg-destructive/10 text-destructive font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-1"
          >
            {mode === 'signin' ? 'Ainda não tem conta? Criar agora' : 'Já tem conta? Entrar'}
          </button>
        </form>

        <p className="text-[10px] text-center text-muted-foreground mt-4">
          Seus dados ficam salvos na nuvem e sincronizados entre dispositivos.
        </p>
      </div>
    </div>
  );
}
