/**
 * Server function: gera insights semanais usando Lovable AI Gateway.
 * Recebe um snapshot de dados (corpo, hábitos, PRs, nutrição) e devolve análise + sugestões.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface InsightsInput {
  snapshot: {
    weekStart: string;
    weekEnd: string;
    body: { date: string; weight: number | null; waist: number | null; body_fat: number | null }[];
    habits: { date: string; workout_done: boolean; diet_ok: boolean; water: boolean; sleep_hours: number | null }[];
    nutrition: { date: string; calories: number; protein: number; carbs: number; fat: number }[];
    prs: { exercise_name: string; estimated_1rm: number; date: string }[];
    profile: { age?: number; height_cm?: number; weight_kg?: number; bf_pct?: number; goal?: string; calorie_target?: number };
  };
}

const SYSTEM_PROMPT = `Você é um coach de transformação corporal experiente, direto e motivador.
Analise os dados da semana do usuário e responda em PT-BR no formato:

## 📊 Resumo da Semana
2-3 frases factuais sobre evolução (peso, cintura, BF, consistência).

## ✅ O que está funcionando
3 pontos positivos concretos.

## ⚠️ Pontos de atenção
2-3 ajustes recomendados (treino, dieta, sono, hidratação).

## 🎯 Foco para próxima semana
1 ação prioritária objetiva.

Seja específico com números. NÃO invente dados que não foram fornecidos. Se faltar dado, recomende registrar.
Tom: firme, sem rodeios, motivador. Máx 250 palavras.`;

export const generateWeeklyInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: InsightsInput) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY não configurado");
    }

    const userPayload = JSON.stringify(data.snapshot, null, 2);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Dados da semana (${data.snapshot.weekStart} → ${data.snapshot.weekEnd}):\n\n${userPayload}` },
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error("Muitas requisições — tente novamente em alguns instantes");
    }
    if (response.status === 402) {
      throw new Error("Sem créditos de IA — adicione créditos em Configurações → Workspace → Uso");
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`Erro na IA (${response.status})`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    return { content, generatedAt: new Date().toISOString() };
  });
