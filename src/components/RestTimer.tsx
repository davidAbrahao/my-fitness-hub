import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X, Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
  defaultSeconds?: number;
  onClose: () => void;
}

export function RestTimer({ defaultSeconds = 90, onClose }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            vibrate();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining, vibrate]);

  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const presets = [30, 45, 60, 90, 120];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 left-4 right-4 z-50 glass-card neon-glow p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-primary" />
          <span className="text-sm font-bold text-foreground">Descanso</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground">
          <X size={18} />
        </button>
      </div>

      {/* Progress ring */}
      <div className="flex items-center justify-center mb-3">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" strokeWidth="6" opacity="0.3" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={remaining === 0 ? 'var(--success)' : 'var(--primary)'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-black ${remaining === 0 ? 'text-success neon-text' : 'text-foreground'}`}>
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Done message */}
      {remaining === 0 && (
        <div className="text-center text-sm font-bold text-success mb-3 animate-pulse">
          ⏰ BORA! Próxima série!
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <button
          onClick={() => { setRemaining(totalSeconds); setIsRunning(true); }}
          className="p-2 rounded-full bg-secondary text-secondary-foreground"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-3 rounded-full bg-primary text-primary-foreground"
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>

      {/* Presets */}
      <div className="flex gap-2 justify-center">
        {presets.map(s => (
          <button
            key={s}
            onClick={() => { setTotalSeconds(s); setRemaining(s); setIsRunning(true); }}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              totalSeconds === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {s}s
          </button>
        ))}
      </div>
    </motion.div>
  );
}
