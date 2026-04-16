// Exercise utility functions: GIF links, calorie estimates

// Map exercise names to MuscleWiki search URLs for GIFs
const exerciseGifMap: Record<string, string> = {
  // PUSH
  'Supino Reto': 'https://musclewiki.com/barbell/male/chest/barbell-bench-press',
  'Supino Inclinado Halter': 'https://musclewiki.com/dumbbells/male/chest/dumbbell-incline-bench-press',
  'Desenvolvimento Halter': 'https://musclewiki.com/dumbbells/male/shoulders/dumbbell-shoulder-press',
  'Elevação Lateral': 'https://musclewiki.com/dumbbells/male/shoulders/dumbbell-lateral-raise',
  'Tríceps Corda': 'https://musclewiki.com/cables/male/triceps/cable-push-down',
  'Paralelas': 'https://musclewiki.com/bodyweight/male/chest/dips',
  // PULL
  'Puxada Frente': 'https://musclewiki.com/cables/male/lats/cable-lat-pulldown',
  'Remada Curvada': 'https://musclewiki.com/barbell/male/lats/barbell-bent-over-row',
  'Remada Baixa': 'https://musclewiki.com/cables/male/lats/cable-seated-row',
  'Face Pull': 'https://musclewiki.com/cables/male/rear-shoulders/cable-face-pull',
  'Rosca Direta': 'https://musclewiki.com/barbell/male/biceps/barbell-curl',
  'Rosca Alternada': 'https://musclewiki.com/dumbbells/male/biceps/dumbbell-curl',
  // LEGS
  'Agachamento': 'https://musclewiki.com/barbell/male/quads/barbell-squat',
  'Leg Press': 'https://musclewiki.com/machine/male/quads/machine-leg-press',
  'Stiff': 'https://musclewiki.com/barbell/male/hamstrings/barbell-romanian-deadlift',
  'Extensora': 'https://musclewiki.com/machine/male/quads/machine-leg-extension',
  'Flexora': 'https://musclewiki.com/machine/male/hamstrings/machine-leg-curl',
  'Panturrilha': 'https://musclewiki.com/machine/male/calves/machine-calf-raise',
  // UPPER
  'Supino Máquina': 'https://musclewiki.com/machine/male/chest/machine-chest-press',
  'Remada Máquina': 'https://musclewiki.com/machine/male/lats/machine-seated-row',
  'Tríceps Testa': 'https://musclewiki.com/barbell/male/triceps/barbell-skull-crusher',
  // LOWER/Circuit
  'Agachamento (Força)': 'https://musclewiki.com/barbell/male/quads/barbell-squat',
  'Stiff (Força)': 'https://musclewiki.com/barbell/male/hamstrings/barbell-romanian-deadlift',
  // Movement blocks
  'Agachamentos': 'https://musclewiki.com/bodyweight/male/quads/bodyweight-squat',
  'Flexões': 'https://musclewiki.com/bodyweight/male/chest/push-up',
  'Prancha': 'https://musclewiki.com/bodyweight/male/abdominals/front-plank',
  'Polichinelos': 'https://musclewiki.com/bodyweight/male/cardio/jumping-jack',
};

export function getExerciseGifUrl(exerciseName: string): string | null {
  // Try exact match first
  if (exerciseGifMap[exerciseName]) return exerciseGifMap[exerciseName];
  
  // Try partial match
  const key = Object.keys(exerciseGifMap).find(k => 
    exerciseName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(exerciseName.toLowerCase())
  );
  if (key) return exerciseGifMap[key];
  
  // Fallback: search on musclewiki
  const query = encodeURIComponent(exerciseName.replace(/[🔥💥]/g, '').trim());
  return `https://musclewiki.com/search?q=${query}`;
}

// Calorie burn estimates per workout type (approximate for 93kg male, ~60min session)
export const workoutCalories: Record<string, { min: number; max: number; label: string }> = {
  push: { min: 280, max: 380, label: 'Musculação + Caminhada' },
  pull: { min: 350, max: 480, label: 'Musculação + HIIT' },
  legs: { min: 350, max: 450, label: 'Musculação Pesada + Cardio Leve' },
  upper: { min: 330, max: 460, label: 'Musculação + HIIT' },
  lower: { min: 400, max: 550, label: 'Musculação + Circuito Metabólico' },
};

// Calorie burn for cardio activities
export const cardioCalories: Record<string, number> = {
  'Caminhada (20min)': 120,
  'Caminhada inclinada (20min)': 160,
  'HIIT (15min)': 200,
  'Elíptico (20min)': 140,
  'Caminhada ao ar livre (30min)': 180,
  'Circuito metabólico': 250,
  'Bloco de movimento (5min)': 30,
  'Caminhada curta (15min)': 90,
};
