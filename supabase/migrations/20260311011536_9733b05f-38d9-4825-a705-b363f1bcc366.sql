-- Fix overpermissive challenges policy
DROP POLICY IF EXISTS "Authenticated users can view challenges by share code" ON public.challenges;
DROP POLICY IF EXISTS "Users can view challenges they're part of" ON public.challenges;

-- Keep only the owner policy (already exists) and add a lookup RPC instead

-- Ensure interview_sessions has RLS enabled (may already be enabled)
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to be safe (they may already exist from config)
DROP POLICY IF EXISTS "Users can view own interview sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can create own interview sessions" ON public.interview_sessions;
DROP POLICY IF EXISTS "Users can update own interview sessions" ON public.interview_sessions;

CREATE POLICY "Users can view own interview sessions"
  ON public.interview_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interview sessions"
  ON public.interview_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions"
  ON public.interview_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create a secure RPC for challenge lookup by share code
CREATE OR REPLACE FUNCTION public.lookup_challenge_by_share_code(p_share_code text)
RETURNS SETOF public.challenges
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.challenges WHERE share_code = p_share_code LIMIT 1;
$$;