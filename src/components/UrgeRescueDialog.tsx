/**
 * Dialog "Estou com vontade de doce AGORA" — anti-falha contextual.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Coffee, Droplets, Clock, Heart } from 'lucide-react';

const STRATEGIES = [
  {
    icon: Droplets,
    title: '1. Beba 500ml de água gelada',
    desc: 'Sede e fome de doce ativam a mesma região do cérebro. Espere 10 min.',
  },
  {
    icon: Coffee,
    title: '2. Café puro ou chá sem açúcar',
    desc: 'Cafeína corta o pico de glicose. Evita pedir doce no automático.',
  },
  {
    icon: Apple,
    title: '3. Substitutos com proteína',
    desc: '1 ovo cozido + maçã / iogurte natural com canela / pasta de amendoim 1 col.',
  },
  {
    icon: Clock,
    title: '4. Cronômetro de 15 min',
    desc: 'Vontade de doce dura ~12 min. Ocupe a mente: caminhe, respire, ligue pra alguém.',
  },
  {
    icon: Heart,
    title: '5. Dose controlada (último recurso)',
    desc: '1 quadrado de chocolate 70%+ ou 1 fruta. Mastigue devagar. Sem culpa, sem segundo.',
  },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onLogged?: (handled: boolean) => void;
}

export function UrgeRescueDialog({ open, onClose, onLogged }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-card w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-border max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-black text-foreground">🆘 Vontade de doce</h3>
                <p className="text-[11px] text-muted-foreground">Faça na ordem. Vai passar.</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {STRATEGIES.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="glass-card p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground">{s.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => { onLogged?.(true); onClose(); }}
                  className="bg-success text-success-foreground font-bold py-3 rounded-lg text-xs"
                >
                  ✅ Resisti
                </button>
                <button
                  onClick={() => { onLogged?.(false); onClose(); }}
                  className="bg-secondary text-secondary-foreground font-bold py-3 rounded-lg text-xs"
                >
                  Cedi (sem culpa)
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
