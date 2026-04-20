/**
 * Card de modo "fim de semana" — aparece sex/sáb/dom no Hoje.
 */
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const TIPS_BY_DAY: Record<number, { title: string; bullets: string[] }> = {
  5: {
    title: 'Sexta — Plano da noite',
    bullets: [
      'Defina ANTES o que vai comer/beber (não decida na hora)',
      'Se for beber: 2 doses no máx + 2 copos de água entre',
      'Marca treino de sábado pra criar âncora',
    ],
  },
  6: {
    title: 'Sábado — Refeição livre controlada',
    bullets: [
      '1 refeição livre, não 1 dia livre',
      'Mantém proteína em todas as refeições',
      'Caminhada de 30 min depois compensa',
    ],
  },
  0: {
    title: 'Domingo — Retomada',
    bullets: [
      'Marmita pronta da semana = -50% chance de furar',
      'Pesa hoje p/ ter referência da semana',
      'Treino leve ou caminhada longa',
    ],
  },
};

export function WeekendModeCard() {
  const day = new Date().getDay();
  const cfg = TIPS_BY_DAY[day];
  if (!cfg) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card tactical-border p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={14} className="text-warning" />
        <h3 className="text-sm font-bold text-foreground">{cfg.title}</h3>
      </div>
      <ul className="space-y-1.5">
        {cfg.bullets.map((b) => (
          <li key={b} className="text-xs text-muted-foreground flex gap-2">
            <span className="text-warning font-bold">›</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
