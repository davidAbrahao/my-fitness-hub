-- ============================================
-- Função utilitária de timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BODY METRICS
-- ============================================
CREATE TABLE public.body_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC(5,2),
  waist NUMERIC(5,2),
  chest NUMERIC(5,2),
  arm NUMERIC(5,2),
  thigh NUMERIC(5,2),
  hip NUMERIC(5,2),
  body_fat NUMERIC(4,2),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_body_metrics_user_date ON public.body_metrics(user_id, date DESC);
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own body metrics"
  ON public.body_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own body metrics"
  ON public.body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own body metrics"
  ON public.body_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own body metrics"
  ON public.body_metrics FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_body_metrics_updated_at
  BEFORE UPDATE ON public.body_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- WORKOUTS
-- ============================================
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration_min INTEGER,
  calories_estimated INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workouts_user_date ON public.workouts(user_id, date DESC);
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workouts"
  ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own workouts"
  ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own workouts"
  ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own workouts"
  ON public.workouts FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- EXERCISES LOGS
-- ============================================
CREATE TABLE public.exercises_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb,
  rpe NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_logs_workout ON public.exercises_logs(workout_id);
CREATE INDEX idx_exercises_logs_user_exercise ON public.exercises_logs(user_id, exercise_id);
ALTER TABLE public.exercises_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own exercise logs"
  ON public.exercises_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own exercise logs"
  ON public.exercises_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own exercise logs"
  ON public.exercises_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own exercise logs"
  ON public.exercises_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- NUTRITION LOGS
-- ============================================
CREATE TABLE public.nutrition_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories INTEGER,
  protein NUMERIC(6,2),
  carbs NUMERIC(6,2),
  fat NUMERIC(6,2),
  meals JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_nutrition_user_date ON public.nutrition_logs(user_id, date DESC);
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own nutrition"
  ON public.nutrition_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own nutrition"
  ON public.nutrition_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own nutrition"
  ON public.nutrition_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own nutrition"
  ON public.nutrition_logs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_nutrition_logs_updated_at
  BEFORE UPDATE ON public.nutrition_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- HABITS LOGS
-- ============================================
CREATE TABLE public.habits_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  water BOOLEAN NOT NULL DEFAULT false,
  creatine BOOLEAN NOT NULL DEFAULT false,
  workout_done BOOLEAN NOT NULL DEFAULT false,
  diet_ok BOOLEAN NOT NULL DEFAULT false,
  cardio BOOLEAN NOT NULL DEFAULT false,
  supplements BOOLEAN NOT NULL DEFAULT false,
  sleep_hours NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_habits_user_date ON public.habits_logs(user_id, date DESC);
ALTER TABLE public.habits_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own habits"
  ON public.habits_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own habits"
  ON public.habits_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own habits"
  ON public.habits_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own habits"
  ON public.habits_logs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_habits_logs_updated_at
  BEFORE UPDATE ON public.habits_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- PERSONAL RECORDS
-- ============================================
CREATE TABLE public.personal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  weight NUMERIC(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  estimated_1rm NUMERIC(6,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pr_user_exercise_date ON public.personal_records(user_id, exercise_id, date DESC);
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own PRs"
  ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own PRs"
  ON public.personal_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own PRs"
  ON public.personal_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own PRs"
  ON public.personal_records FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STORAGE: body photos bucket (private)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('body-photos', 'body-photos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view own body photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own body photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own body photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own body photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'body-photos' AND auth.uid()::text = (storage.foldername(name))[1]);