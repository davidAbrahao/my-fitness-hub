import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

// BarcodeDetector is experimental — type it loosely
declare global {
  interface Window {
    BarcodeDetector?: any;
  }
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState<boolean>(true);
  const [manual, setManual] = useState('');
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const hasAPI = typeof window !== 'undefined' && 'BarcodeDetector' in window;
    if (!hasAPI) {
      setSupported(false);
      setShowManual(true);
      return;
    }

    let active = true;
    let detector: any;

    async function start() {
      try {
        detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const scan = async () => {
          if (!active || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes && codes.length > 0) {
              const code = codes[0].rawValue;
              if (code) {
                cleanup();
                onDetected(code);
                return;
              }
            }
          } catch {
            // ignore frame errors
          }
          rafRef.current = requestAnimationFrame(scan);
        };
        rafRef.current = requestAnimationFrame(scan);
      } catch (e) {
        const msg = (e as Error).message || 'Erro ao acessar câmera';
        setError(msg);
        setShowManual(true);
      }
    }

    function cleanup() {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    }

    start();
    return cleanup;
  }, [onDetected]);

  function submitManual(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = manual.trim();
    if (trimmed.length >= 6) onDetected(trimmed);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center gap-2 border-b border-white/10 bg-black/80">
        <Camera size={18} className="text-primary" />
        <h2 className="text-base font-bold text-white flex-1">Escanear Código</h2>
        <button
          onClick={() => setShowManual((s) => !s)}
          className="p-1.5 rounded-lg bg-white/10 text-white"
          aria-label="Digitar manualmente"
          title="Digitar código"
        >
          <Keyboard size={16} />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 text-white"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {supported && !error && (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay frame */}
            <div className="relative z-10 pointer-events-none">
              <div className="w-64 h-40 border-2 border-primary rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
              <div className="text-center mt-4 text-white text-xs flex items-center justify-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                Aponte para o código de barras
              </div>
            </div>
          </>
        )}

        {!supported && (
          <div className="text-center text-white p-6">
            <Camera size={36} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold mb-1">Scanner não suportado</p>
            <p className="text-xs text-white/70">
              Seu navegador não suporta a API BarcodeDetector. Digite o código manualmente abaixo.
            </p>
          </div>
        )}

        {error && (
          <div className="text-center text-white p-6">
            <p className="text-sm font-bold text-destructive mb-1">Erro na câmera</p>
            <p className="text-xs text-white/70 mb-2">{error}</p>
            <p className="text-xs text-white/70">Permita o acesso à câmera ou digite o código.</p>
          </div>
        )}
      </div>

      {/* Manual entry */}
      {showManual && (
        <form
          onSubmit={submitManual}
          className="bg-card border-t border-border p-4 space-y-2"
        >
          <label className="text-xs font-bold text-muted-foreground">Código de barras</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={manual}
              onChange={(e) => setManual(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 7891000100103"
              autoFocus
              className="flex-1 bg-input text-foreground text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={manual.trim().length < 6}
              className="bg-primary text-primary-foreground font-bold text-sm px-4 rounded-lg disabled:opacity-40"
            >
              Buscar
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
