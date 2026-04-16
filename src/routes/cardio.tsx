import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "../components/PageHeader";
import { cardioProtocol } from "../lib/training-data";
import { cardioCalories } from "../lib/exercise-utils";
import { load, save, todayKey } from "../lib/storage";
import {
  Heart, Clock, Zap, AlertTriangle, Play, Pause, RotateCcw,
  Plus, Check, Footprints, Timer, X, ChevronDown, ChevronUp
} from "lucide-react";

export const Route = createFileRoute("/cardio")({
  component: CardioPage,
  head: () => ({
    meta: [{ title: "Cardio & Movimento — Barriga Zero" }],
  }),
});

interface CardioLog {
  date: string;
  type: string;
  duration: string;
  notes: string;
  calories?: number;
}

interface MovementBlock {
  time: string;
  exercise: string;
  done: boolean;
}

interface DailyMovement {
  date: string;
  blocks: MovementBlock[];
  walks: { time: string; duration: string; done: boolean }[];
}

type Tab = 'protocol' | 'registro' | 'blocos';

function CardioPage() {
  const [tab, setTab] = useState<Tab>('protocol');
  
  const tabs = [
    { id: 'protocol' as Tab, label: 'Protocolo', icon: Heart },
    { id: 'registro' as Tab, label: 'Registro', icon: Plus },
    { id: 'blocos' as Tab, label: 'Blocos', icon: Footprints },
  ];

  return (
    <div>
      <PageHeader title="CARDIO & MOVIMENTO" subtitle="Registro de cardio e blocos de movimento" emoji="❤️‍🔥" />

      <div className="px-4 mb-4 flex gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-primary text-primary-foreground neon-glow"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'protocol' && <ProtocolView />}
          {tab === 'registro' && <CardioRegistro />}
          {tab === 'blocos' && <MovementBlocks />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────── Protocol View ───────────── */
function ProtocolView() {
  const typeColors: Record<string, string> = {
    LISS: 'text-success',
    HIIT: 'text-destructive',
    MISS: 'text-warning',
    'METABÓLICO': 'text-primary',
  };

  const typeBg: Record<string, string> = {
    LISS: 'bg-success/10 tactical-border',
    HIIT: 'bg-destructive/10 border border-destructive/20',
    MISS: 'bg-warning/10 border border-warning/20',
    'METABÓLICO': 'bg-primary/10 border border-primary/20',
  };

  return (
    <>
      <div className="px-4 space-y-3 mb-6">
        {cardioProtocol.sessions.map((session, i) => (
          <motion.div
            key={session.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 ${typeBg[session.type]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-muted-foreground">{session.day}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">
                  ~{cardioCalories[session.activity] ?? cardioCalories['Caminhada (20min)']} kcal
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${typeColors[session.type]} bg-background/50`}>
                  {session.type}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-primary" />
                <span className="text-sm font-bold text-foreground">{session.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={12} className="text-destructive" />
                <span className="text-xs text-muted-foreground">{session.intensity}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <Zap size={12} className="text-warning" />
              <span className="text-sm font-semibold text-foreground">{session.activity}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">💡 {session.tip}</p>
          </motion.div>
        ))}
      </div>

      <div className="px-4 mb-6">
        <div className="glass-card p-4 border border-destructive/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-destructive" />
            <h3 className="text-sm font-bold text-foreground">Regras do Cardio</h3>
          </div>
          <ul className="space-y-2">
            {cardioProtocol.rules.map((rule, i) => (
              <li key={i} className="text-xs text-secondary-foreground flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Legenda</h3>
          <div className="space-y-2">
            {[
              { type: 'LISS', color: 'text-success', bg: 'bg-success/10', desc: 'Low Intensity Steady State — Queima gordura, preserva músculo' },
              { type: 'MISS', color: 'text-warning', bg: 'bg-warning/10', desc: 'Moderate Intensity — Trote moderado, equilíbrio' },
              { type: 'HIIT', color: 'text-destructive', bg: 'bg-destructive/10', desc: 'High Intensity Interval — Máxima queima calórica pós-treino' },
            ].map(l => (
              <div key={l.type} className="flex items-center gap-3">
                <span className={`text-xs font-black ${l.color} px-2 py-0.5 rounded-full ${l.bg}`}>{l.type}</span>
                <span className="text-xs text-muted-foreground">{l.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────────── Cardio Registration ───────────── */
function CardioRegistro() {
  const [logs, setLogs] = useState<CardioLog[]>([]);
  const [type, setType] = useState('LISS');
  const [duration, setDuration] = useState('20');
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(false);
  const today = todayKey();

  useEffect(() => {
    setLogs(load<CardioLog[]>('cardio_logs', []));
  }, []);

  function addLog() {
    const cal = type === 'HIIT' ? 200 : type === 'METABÓLICO' ? 250 : Math.round(parseInt(duration) * 7);
    const log: CardioLog = {
      date: today,
      type,
      duration: `${duration} min`,
      notes: notes.trim(),
      calories: cal,
    };
    const updated = [log, ...logs];
    setLogs(updated);
    save('cardio_logs', updated);
    setNotes('');
    setDuration('20');
  }

  const todayLogs = logs.filter(l => l.date === today);
  const todayCalories = todayLogs.reduce((s, l) => s + (l.calories ?? 0), 0);

  return (
    <div className="px-4 space-y-4">
      {/* Add cardio */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">🏃 Registrar Cardio</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {['LISS', 'HIIT', 'MISS', 'METABÓLICO'].map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-[10px] font-bold py-2 rounded-lg transition-all ${
                type === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground font-bold">Duração (min)</label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground font-bold">Notas</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: caminhada inclinada"
              className="w-full bg-input text-foreground text-sm px-3 py-2 rounded-lg border-0 outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>
        </div>
        <button onClick={addLog} className="w-full bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-lg">
          Registrar
        </button>
      </div>

      {/* Today summary */}
      {todayLogs.length > 0 && (
        <div className="glass-card p-4 tactical-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">📊 Hoje</span>
            <span className="text-xs font-bold text-primary">~{todayCalories} kcal queimadas</span>
          </div>
          {todayLogs.map((l, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-secondary rounded-lg px-3 py-2 mb-1">
              <span className="font-bold text-foreground">{l.type}</span>
              <span className="text-muted-foreground">{l.duration}</span>
              <span className="text-primary font-bold">~{l.calories} kcal</span>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground font-bold"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Histórico ({logs.length} registros)
      </button>
      {expanded && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {logs.slice(0, 30).map((l, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-secondary rounded-lg px-3 py-2">
              <span className="text-muted-foreground">{l.date}</span>
              <span className="font-bold text-foreground">{l.type}</span>
              <span className="text-muted-foreground">{l.duration}</span>
              <span className="text-primary font-bold">~{l.calories} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── Movement Blocks ───────────── */
const BLOCK_EXERCISES = [
  '20 agachamentos',
  '15 flexões',
  '30s prancha',
  'Subir escada',
  'Polichinelos (30s)',
  'Alongamento (2min)',
];

function MovementBlocks() {
  const today = todayKey();
  const [data, setData] = useState<DailyMovement>({
    date: today,
    blocks: [],
    walks: [],
  });
  const [timerActive, setTimerActive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(60);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = load<DailyMovement | null>(`movement_${today}`, null);
    if (saved) setData(saved);
  }, [today]);

  const saveData = useCallback((d: DailyMovement) => {
    setData(d);
    save(`movement_${today}`, d);
  }, [today]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timerRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            // Time's up - notify
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('🏃 Hora de se mover!', {
                body: 'Levante e faça um bloco de movimento!',
              });
            }
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive, timerRemaining]);

  function startBlockTimer() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setTimerRemaining(timerMinutes * 60);
    setTimerActive(true);
  }

  function addBlock(exercise: string) {
    const block: MovementBlock = {
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      exercise,
      done: true,
    };
    const updated = { ...data, blocks: [...data.blocks, block] };
    saveData(updated);
    
    // Restart timer
    if (timerActive || timerRemaining === 0) {
      setTimerRemaining(timerMinutes * 60);
      setTimerActive(true);
    }
  }

  function addWalk() {
    const walk = {
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      duration: '15 min',
      done: true,
    };
    const updated = { ...data, walks: [...data.walks, walk] };
    saveData(updated);
  }

  const blocksToday = data.blocks.length;
  const walksToday = data.walks.length;
  const blockCalories = blocksToday * 30;
  const walkCalories = walksToday * 90;
  const totalMins = Math.floor(timerRemaining / 60);
  const totalSecs = timerRemaining % 60;

  return (
    <div className="px-4 space-y-4">
      {/* Timer */}
      <div className="glass-card p-4 tactical-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">⏰ Timer de Movimento</h3>
          <span className="text-xs text-muted-foreground">A cada {timerMinutes}min</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          {[30, 45, 60, 90].map(m => (
            <button
              key={m}
              onClick={() => setTimerMinutes(m)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                timerMinutes === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {m}min
            </button>
          ))}
        </div>

        {timerActive ? (
          <div className="text-center">
            <div className="text-3xl font-black text-primary mb-2">
              {String(totalMins).padStart(2, '0')}:{String(totalSecs).padStart(2, '0')}
            </div>
            <p className="text-xs text-muted-foreground mb-3">Próximo bloco de movimento</p>
            <div className="flex gap-2">
              <button
                onClick={() => setTimerActive(false)}
                className="flex-1 flex items-center justify-center gap-1 bg-secondary text-secondary-foreground text-xs font-bold py-2 rounded-lg"
              >
                <Pause size={14} /> Pausar
              </button>
              <button
                onClick={() => { setTimerActive(false); setTimerRemaining(0); }}
                className="flex items-center justify-center gap-1 bg-destructive/20 text-destructive text-xs font-bold px-4 py-2 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startBlockTimer}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm py-3 rounded-lg"
          >
            <Play size={16} /> Iniciar Timer ({timerMinutes}min)
          </button>
        )}
      </div>

      {/* Today's progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground">📊 Progresso do Dia</h3>
          <span className="text-xs font-bold text-primary">~{blockCalories + walkCalories} kcal</span>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-secondary rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-foreground">{blocksToday}</div>
            <div className="text-[10px] text-muted-foreground font-bold">Blocos (meta: 6-8)</div>
            <div className="progress-bar-bg h-1.5 mt-2">
              <div className="progress-bar-fill h-full" style={{ width: `${Math.min(100, (blocksToday / 7) * 100)}%` }} />
            </div>
          </div>
          <div className="bg-secondary rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-foreground">{walksToday}</div>
            <div className="text-[10px] text-muted-foreground font-bold">Caminhadas (meta: 2)</div>
            <div className="progress-bar-bg h-1.5 mt-2">
              <div className="progress-bar-fill h-full" style={{ width: `${Math.min(100, (walksToday / 2) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick add block */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">⚡ Registrar Bloco</h3>
        <p className="text-xs text-muted-foreground mb-3">Escolha o que fez nesse bloco:</p>
        <div className="grid grid-cols-2 gap-2">
          {BLOCK_EXERCISES.map(ex => (
            <button
              key={ex}
              onClick={() => addBlock(ex)}
              className="text-xs font-bold bg-secondary text-secondary-foreground px-3 py-3 rounded-lg hover:bg-primary/20 hover:text-primary transition-all text-left"
            >
              💪 {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Add walk */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">🚶 Caminhada Curta</h3>
        <p className="text-xs text-muted-foreground mb-3">10–15 min manhã ou tarde (~90 kcal)</p>
        <button
          onClick={addWalk}
          className="w-full flex items-center justify-center gap-2 bg-success/20 text-success font-bold text-sm py-2.5 rounded-lg"
        >
          <Check size={16} /> Registrar Caminhada
        </button>
      </div>

      {/* Today's log */}
      {(data.blocks.length > 0 || data.walks.length > 0) && (
        <div className="glass-card p-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Registro de Hoje</h3>
          <div className="space-y-1">
            {data.blocks.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-secondary rounded-lg px-3 py-2">
                <span className="text-muted-foreground">{b.time}</span>
                <span className="text-foreground font-bold">{b.exercise}</span>
                <span className="text-primary">~30 kcal</span>
              </div>
            ))}
            {data.walks.map((w, i) => (
              <div key={`w${i}`} className="flex items-center justify-between text-xs bg-success/10 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">{w.time}</span>
                <span className="text-foreground font-bold">🚶 Caminhada {w.duration}</span>
                <span className="text-success">~90 kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass-card p-4 border border-primary/20 mb-6">
        <h3 className="text-xs font-bold text-primary mb-2">💡 Dica</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Durante o trabalho, a cada 1h: levante 2-5 min. Escolha 1 exercício do bloco acima. 
          Meta: 6-8 blocos por dia. Alternativa: 2 caminhadas curtas de 10-15 min (manhã + tarde).
          Simples, rápido e eficiente!
        </p>
      </div>
    </div>
  );
}
