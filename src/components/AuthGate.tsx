import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth-context';
import { lovable } from '@/integrations/lovable';
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
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? 'Falha no login com Google');
      setGoogleLoading(false);
    }
    // se redirected: o browser navega; nada mais a fazer
  }

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

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full mb-3 bg-foreground text-background font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {googleLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34 5.1 29.3 3 24 3 16.3 3 9.7 7.5 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 40.4 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.8 35.6 45 30.3 45 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
          )}
          Continuar com Google
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-border" />
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
