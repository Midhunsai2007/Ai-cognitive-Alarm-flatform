-- ============================================================
-- COGNITIVE ALARM PLATFORM - SUPABASE DATABASE SCHEMA
-- Project URL: https://lnsgcroyrxlwdeyeommn.supabase.co
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    streak_count INTEGER DEFAULT 0,
    total_alarms INTEGER DEFAULT 0,
    successful_wakes INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Alarms table
CREATE TABLE IF NOT EXISTS public.alarms (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    time TEXT NOT NULL, -- e.g. "07:30"
    label TEXT NOT NULL,
    days JSONB DEFAULT '[]'::jsonb, -- e.g. ["Mon", "Tue", "Wed"]
    cognitive_type TEXT DEFAULT 'math', -- math, pattern, memory, stroop, word
    difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
    sound TEXT DEFAULT 'energetic',
    frequency TEXT DEFAULT 'daily', -- once, daily, weekly
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. History Logs table
CREATE TABLE IF NOT EXISTS public.history_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alarm_id TEXT,
    alarm_label TEXT,
    puzzle_type TEXT,
    solve_time TEXT,
    status TEXT, -- "Success", "Snoozed"
    datetime TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Solve Times table (for adaptive cognitive engine)
CREATE TABLE IF NOT EXISTS public.solve_times (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seconds NUMERIC NOT NULL,
    puzzle_type TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solve_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can read and write their own data)
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own alarms" ON public.alarms
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history" ON public.history_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own solve times" ON public.solve_times
    FOR ALL USING (auth.uid() = user_id);

-- 5. Behavioral States table
CREATE TABLE IF NOT EXISTS public.behavioral_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    state_key TEXT NOT NULL,
    consistency_score NUMERIC DEFAULT 85.0,
    habit_score NUMERIC DEFAULT 86.0,
    avg_snoozes NUMERIC DEFAULT 0,
    avg_accuracy NUMERIC DEFAULT 90.0,
    avg_solve_time NUMERIC DEFAULT 15.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RL Actions / Recommendations table
CREATE TABLE IF NOT EXISTS public.rl_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended_time TEXT DEFAULT '07:00',
    challenge_type TEXT DEFAULT 'math',
    difficulty TEXT DEFAULT 'medium',
    snooze_limit INTEGER DEFAULT 3,
    verification_method TEXT DEFAULT 'standard_single',
    predicted_success NUMERIC DEFAULT 0.85,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RL Experiences table (STATE -> ACTION -> REWARD -> NEXT STATE)
CREATE TABLE IF NOT EXISTS public.rl_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    state TEXT NOT NULL,
    action JSONB NOT NULL,
    reward NUMERIC NOT NULL,
    next_state TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Model Predictions table (XGBoost 4-output predictions)
CREATE TABLE IF NOT EXISTS public.model_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    success_probability NUMERIC DEFAULT 0.85,
    expected_snoozes NUMERIC DEFAULT 1.0,
    expected_accuracy NUMERIC DEFAULT 90.0,
    expected_response_time NUMERIC DEFAULT 14.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for AI/RL tables
ALTER TABLE public.behavioral_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rl_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rl_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon access behavioral_states" ON public.behavioral_states FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon access rl_actions" ON public.rl_actions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon access rl_experiences" ON public.rl_experiences FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon access model_predictions" ON public.model_predictions FOR ALL TO anon USING (true) WITH CHECK (true);

