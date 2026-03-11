-- Fix: restrict anonymous challenge access to only matching share_code
DROP POLICY IF EXISTS "Users can view challenges by share code" ON public.challenges;

CREATE POLICY "Authenticated users can view their own challenges"
ON public.challenges
FOR SELECT
TO authenticated
USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Anyone can view a challenge by share code"
ON public.challenges
FOR SELECT
TO anon, authenticated
USING (share_code IS NOT NULL AND share_code = current_setting('request.headers', true)::json->>'x-share-code');