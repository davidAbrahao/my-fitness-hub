-- 1) USER PROFILES (1 registro por usuário)
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  age int,
  height_cm numeric,
  start_weight_kg numeric,
  goal_weight_kg numeric,
  start_bf_pct numeric,
  goal_bf_pct numeric,
  calorie_target int DEFAULT 1800,
  current_focus text,
  notes text,
  triggers text[] DEFAULT '{}',
  preferences text[] DEFAULT '{}',
  restrictions text[] DEFAULT '{}',
  -- Schedule: { mon: 'push', tue: 'pull', wed: 'rest', ... }
  training_schedule jsonb DEFAULT '{"mon":"push","tue":"pull","wed":"legs","thu":"upper","fri":"lower","sat":"rest","sun":"rest"}'::jsonb,
  training_time time,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile"   ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.user_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) HABITS_LOGS — campos extras de check-in rápido
ALTER TABLE public.habits_logs
  ADD COLUMN IF NOT EXISTS sugar_urge   smallint CHECK (sugar_urge   BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS hunger_level smallint CHECK (hunger_level BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS energy_level smallint CHECK (energy_level BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS mood_level   smallint CHECK (mood_level   BETWEEN 0 AND 3);