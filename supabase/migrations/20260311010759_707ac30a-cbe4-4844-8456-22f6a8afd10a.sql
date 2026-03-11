-- Fix: allow authenticated users to look up challenges by share_code for joining
DROP POLICY IF EXISTS "Anyone can view a challenge by share code" ON public.challenges;

-- Authenticated users can view any challenge with a share_code (needed for joining)
CREATE POLICY "Authenticated users can view challenges by share code"
ON public.challenges
FOR SELECT
TO authenticated
USING (share_code IS NOT NULL);