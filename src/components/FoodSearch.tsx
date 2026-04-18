import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Loader2, Apple, ScanBarcode } from 'lucide-react';
import { searchFoods, getByBarcode, scaleNutrients, type FoodProduct } from '../lib/openfoodfacts';
import { BarcodeScanner } from './BarcodeScanner';

export interface SelectedFood {
  food: FoodProduct;
  grams: number;
  scaled: ReturnType<typeof scaleNutrients>;
}

interface FoodSearchProps {
  onAdd: (item: SelectedFood) => void;
  onClose: () => void;
}

export function FoodSearch({ onAdd, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodProduct | null>(null);
  const [grams, setGrams] = useState(100);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  async function handleBarcode(code: string) {
    setScanning(false);
    setScanError(null);
    setLoading(true);
    const product = await getByBarcode(code);
    setLoading(false);
    if (product) {
      setSelected(product);
      setResults([product]);
      setQuery(product.name);
    } else {
      setScanError(`Código ${code} não encontrado no OpenFoodFacts.`);
    }
  }

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const r = await searchFoods(query);
      setResults(r);
      setLoading(false);
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleAdd() {
    if (!selected) return;
    onAdd({ food: selected, grams, scaled: scaleNutrients(selected, grams) });
    setSelected(null);
    setQuery('');
    setGrams(100);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex items-center gap-2 border-b border-border">
        <Apple size={20} className="text-primary" />
        <h2 className="text-base font-bold text-foreground flex-1">Buscar Alimento</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-secondary text-foreground"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Search input */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: arroz, frango, banana..."
            autoFocus
            className="w-full bg-input text-foreground text-sm pl-9 pr-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Dados de OpenFoodFacts (por 100g) — pode ter variação.
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 size={18} className="animate-spin mr-2" />
            <span className="text-sm">Buscando...</span>
          </div>
        )}
        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum resultado
          </div>
        )}
        <div className="space-y-2">
          {results.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(f)}
              className="w-full text-left bg-secondary hover:bg-secondary/80 rounded-lg p-3 flex gap-3 transition-colors"
            >
              {f.imageUrl ? (
                <img
                  src={f.imageUrl}
                  alt={f.name}
                  className="w-12 h-12 object-cover rounded-md bg-muted shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-12 h-12 rounded-md bg-muted shrink-0 flex items-center justify-center text-muted-foreground">
                  <Apple size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground truncate">{f.name}</div>
                {f.brand && (
                  <div className="text-[10px] text-muted-foreground truncate">{f.brand}</div>
                )}
                <div className="flex gap-2 mt-1 text-[10px] font-bold">
                  <span className="text-destructive">
                    {f.calories ? Math.round(f.calories) : '?'} kcal
                  </span>
                  <span className="text-primary">P:{f.protein?.toFixed(0) ?? '?'}g</span>
                  <span className="text-warning">C:{f.carbs?.toFixed(0) ?? '?'}g</span>
                  <span className="text-muted-foreground">G:{f.fat?.toFixed(0) ?? '?'}g</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected food modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 bg-card border-t border-border rounded-t-2xl p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3 mb-3">
              {selected.imageUrl && (
                <img
                  src={selected.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-md object-cover bg-muted"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">{selected.name}</div>
                {selected.brand && (
                  <div className="text-[10px] text-muted-foreground">{selected.brand}</div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground">
                <X size={16} />
              </button>
            </div>

            <div className="mb-3">
              <label className="text-xs font-bold text-muted-foreground">
                Quantidade (gramas)
              </label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 0))}
                className="w-full bg-input text-foreground text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>

            {(() => {
              const s = scaleNutrients(selected, grams);
              return (
                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                  <div className="bg-destructive/10 rounded-lg py-2">
                    <div className="text-base font-black text-destructive">{s.calories}</div>
                    <div className="text-[9px] text-muted-foreground">kcal</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg py-2">
                    <div className="text-base font-black text-primary">{s.protein}g</div>
                    <div className="text-[9px] text-muted-foreground">prot</div>
                  </div>
                  <div className="bg-warning/10 rounded-lg py-2">
                    <div className="text-base font-black text-warning">{s.carbs}g</div>
                    <div className="text-[9px] text-muted-foreground">carb</div>
                  </div>
                  <div className="bg-muted rounded-lg py-2">
                    <div className="text-base font-black text-foreground">{s.fat}g</div>
                    <div className="text-[9px] text-muted-foreground">gord</div>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleAdd}
              className="w-full bg-primary text-primary-foreground font-bold text-sm py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Adicionar à Refeição
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
