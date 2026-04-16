// 1RM Calculator using multiple formulas for accuracy

export interface RMResult {
  formula: string;
  value: number;
}

// Epley formula: weight × (1 + reps / 30)
function epley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// Brzycki formula: weight × 36 / (37 - reps)
function brzycki(weight: number, reps: number): number {
  if (reps >= 37) return weight;
  if (reps === 1) return weight;
  return weight * 36 / (37 - reps);
}

// Lombardi: weight × reps^0.1
function lombardi(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * Math.pow(reps, 0.1);
}

// O'Conner: weight × (1 + 0.025 × reps)
function oconner(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + 0.025 * reps);
}

export function calculate1RM(weight: number, reps: number): { average: number; results: RMResult[] } {
  if (weight <= 0 || reps <= 0) return { average: 0, results: [] };
  
  const results: RMResult[] = [
    { formula: 'Epley', value: Math.round(epley(weight, reps) * 10) / 10 },
    { formula: 'Brzycki', value: Math.round(brzycki(weight, reps) * 10) / 10 },
    { formula: 'Lombardi', value: Math.round(lombardi(weight, reps) * 10) / 10 },
    { formula: "O'Conner", value: Math.round(oconner(weight, reps) * 10) / 10 },
  ];

  const average = Math.round((results.reduce((s, r) => s + r.value, 0) / results.length) * 10) / 10;
  return { average, results };
}

// Percentage table for training zones
export const percentageZones = [
  { percent: 100, reps: '1', zone: 'Força Máxima', color: 'text-destructive' },
  { percent: 95, reps: '2', zone: 'Força Máxima', color: 'text-destructive' },
  { percent: 90, reps: '3-4', zone: 'Força', color: 'text-warning' },
  { percent: 85, reps: '5-6', zone: 'Força/Hipertrofia', color: 'text-warning' },
  { percent: 80, reps: '7-8', zone: 'Hipertrofia', color: 'text-primary' },
  { percent: 75, reps: '9-10', zone: 'Hipertrofia', color: 'text-primary' },
  { percent: 70, reps: '11-12', zone: 'Hipertrofia/Resist.', color: 'text-success' },
  { percent: 65, reps: '13-15', zone: 'Resistência', color: 'text-success' },
  { percent: 60, reps: '16-20', zone: 'Resistência', color: 'text-muted-foreground' },
];

// Biomechanics data per muscle group
export interface BiomechanicsTip {
  muscleGroup: string;
  emoji: string;
  tips: {
    title: string;
    description: string;
  }[];
}

export const biomechanicsData: BiomechanicsTip[] = [
  {
    muscleGroup: 'Peitoral',
    emoji: '🫁',
    tips: [
      { title: 'Ângulo do Cotovelo', description: 'Mantenha cotovelos a 45° do tronco no supino para proteger o ombro e maximizar ativação peitoral.' },
      { title: 'Retração Escapular', description: 'Junte e "trave" as escápulas no banco. Isso estabiliza o ombro e isola melhor o peitoral.' },
      { title: 'Amplitude Completa', description: 'Desça até a barra tocar levemente o peito. Amplitude parcial = menos hipertrofia.' },
      { title: 'Arco Torácico', description: 'Um leve arco nas costas (não lombar) aumenta a ativação do peitoral e protege os ombros.' },
    ],
  },
  {
    muscleGroup: 'Costas',
    emoji: '🦴',
    tips: [
      { title: 'Puxe com o Cotovelo', description: 'Pense em puxar os cotovelos para trás/baixo, não em puxar com as mãos. Isso ativa mais as costas.' },
      { title: 'Pegada', description: 'Pegada pronada (palma pra baixo) = mais dorsal. Supinada = mais bíceps e dorsal inferior.' },
      { title: 'Squeeze no Pico', description: 'Segure 1-2s na contração máxima. A maioria das pessoas solta rápido demais.' },
      { title: 'Tronco Neutro', description: 'Nas remadas, mantenha coluna neutra. Arredondar = lesão no disco.' },
    ],
  },
  {
    muscleGroup: 'Ombros',
    emoji: '🎯',
    tips: [
      { title: 'Elevação Lateral Correta', description: 'Incline levemente o tronco. Gire o mindinho pra cima como se fosse derramar água de um copo.' },
      { title: 'Desenvolvimento', description: 'Não tranque os cotovelos no topo. Mantenha tensão constante no deltóide.' },
      { title: 'Face Pull', description: 'Puxe para o rosto com rotação externa. Essencial para saúde do manguito rotador.' },
      { title: 'Plano Escapular', description: 'Eleve os braços no plano da escápula (~30° à frente), não diretamente ao lado.' },
    ],
  },
  {
    muscleGroup: 'Pernas',
    emoji: '🦵',
    tips: [
      { title: 'Agachamento - Joelhos', description: 'Joelhos podem (e devem) passar da ponta dos pés. O mito de "não passar" limita amplitude.' },
      { title: 'Stiff - Quadril', description: 'O movimento é de FLEXÃO de quadril, não de flexão de coluna. Empurre o quadril pra trás.' },
      { title: 'Ativação de Glúteo', description: 'No leg press e agachamento, empurre pelo calcanhar e pense em "abrir o chão" com os pés.' },
      { title: 'Profundidade', description: 'Desça até pelo menos paralelo (coxa paralela ao chão). Mais profundo = mais glúteo e mais seguro pro joelho.' },
    ],
  },
  {
    muscleGroup: 'Bíceps',
    emoji: '💪',
    tips: [
      { title: 'Sem Balanço', description: 'Fixe os cotovelos ao lado do corpo. Se precisa balançar, o peso está pesado demais.' },
      { title: 'Supinação', description: 'Na rosca alternada, gire o punho de neutro para supinado durante a subida para ativação máxima.' },
      { title: 'Negativa Lenta', description: 'A fase excêntrica (descida) deve durar 2-3s. É onde mais se constrói músculo.' },
    ],
  },
  {
    muscleGroup: 'Tríceps',
    emoji: '🔱',
    tips: [
      { title: 'Cotovelos Fixos', description: 'Na corda e testa, mantenha cotovelos fixos apontando pra frente. Sem abrir.' },
      { title: 'Extensão Completa', description: 'Estenda completamente o braço e aperte no final. A cabeça longa do tríceps precisa dessa amplitude.' },
      { title: 'Paralelas', description: 'Tronco mais ereto = mais tríceps. Inclinado pra frente = mais peitoral.' },
    ],
  },
];

// Smart alternatives based on equipment availability
export interface SmartAlternative {
  originalExercise: string;
  alternatives: {
    name: string;
    equipment: string;
    difficulty: 'Fácil' | 'Médio' | 'Avançado';
    muscleActivation: string;
    why: string;
  }[];
}

export const smartAlternatives: SmartAlternative[] = [
  {
    originalExercise: 'Supino Reto',
    alternatives: [
      { name: 'Supino com Halteres', equipment: 'Halteres + Banco', difficulty: 'Médio', muscleActivation: 'Peitoral + Estabilizadores', why: 'Maior amplitude e ativação de estabilizadores. Corrige desequilíbrios entre os lados.' },
      { name: 'Flexão de Braço', equipment: 'Peso Corporal', difficulty: 'Fácil', muscleActivation: 'Peitoral + Core', why: 'Zero equipamento. Adicione peso nas costas para progressão.' },
      { name: 'Floor Press', equipment: 'Halteres', difficulty: 'Fácil', muscleActivation: 'Peitoral + Tríceps', why: 'Sem banco? Deite no chão. Protege ombros limitando amplitude.' },
    ],
  },
  {
    originalExercise: 'Agachamento',
    alternatives: [
      { name: 'Goblet Squat', equipment: 'Halter/Kettlebell', difficulty: 'Fácil', muscleActivation: 'Quadríceps + Core', why: 'Peso frontal força postura ereta. Ótimo para aprender o padrão.' },
      { name: 'Bulgarian Split Squat', equipment: 'Halteres + Banco', difficulty: 'Avançado', muscleActivation: 'Quadríceps + Glúteo unilateral', why: 'Corrige assimetrias. Altíssima ativação de glúteo.' },
      { name: 'Hack Squat', equipment: 'Máquina', difficulty: 'Médio', muscleActivation: 'Quadríceps isolado', why: 'Retira carga axial da coluna. Ótimo para focar em quadríceps.' },
    ],
  },
  {
    originalExercise: 'Puxada Frente',
    alternatives: [
      { name: 'Barra Fixa', equipment: 'Barra', difficulty: 'Avançado', muscleActivation: 'Dorsal + Bíceps', why: 'Rei dos exercícios de costas. Peso corporal = carga real.' },
      { name: 'Pulldown Unilateral', equipment: 'Polia', difficulty: 'Médio', muscleActivation: 'Dorsal (cada lado)', why: 'Corrige desequilíbrios. Maior conexão mente-músculo.' },
      { name: 'Remada Invertida', equipment: 'Barra/Smith', difficulty: 'Fácil', muscleActivation: 'Costas + Core', why: 'Alternativa sem máquina. Ajuste dificuldade pela altura da barra.' },
    ],
  },
  {
    originalExercise: 'Desenvolvimento',
    alternatives: [
      { name: 'Arnold Press', equipment: 'Halteres', difficulty: 'Médio', muscleActivation: 'Deltóide (todas as cabeças)', why: 'Rotação ativa as 3 cabeças do deltóide. Mais completo que o tradicional.' },
      { name: 'Militar em Pé', equipment: 'Barra', difficulty: 'Avançado', muscleActivation: 'Deltóide + Core', why: 'Em pé ativa core intensamente. Mais funcional e hormonal.' },
      { name: 'Landmine Press', equipment: 'Barra + Canto', difficulty: 'Médio', muscleActivation: 'Deltóide anterior + Serrátil', why: 'Amigável para ombros problemáticos. Ângulo natural do movimento.' },
    ],
  },
  {
    originalExercise: 'Stiff',
    alternatives: [
      { name: 'Romeno com Halteres', equipment: 'Halteres', difficulty: 'Médio', muscleActivation: 'Posterior + Glúteo', why: 'Halteres permitem trajetória mais natural e confortável.' },
      { name: 'Good Morning', equipment: 'Barra', difficulty: 'Avançado', muscleActivation: 'Posterior + Lombar', why: 'Excelente para cadeia posterior. Use carga leve e controle total.' },
      { name: 'Elevação Pélvica', equipment: 'Banco + Barra', difficulty: 'Fácil', muscleActivation: 'Glúteo máximo', why: 'Se o foco é glúteo, nada supera o hip thrust. Rei da ativação glútea.' },
    ],
  },
];

// PR tracking types
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
}
