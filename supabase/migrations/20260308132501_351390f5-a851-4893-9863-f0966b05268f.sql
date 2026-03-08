
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  domain_id uuid REFERENCES public.domains(id),
  topic_id uuid REFERENCES public.topics(id),
  subtopic_id uuid REFERENCES public.subtopics(id),
  difficulty text NOT NULL DEFAULT 'intermediate',
  question_text text,
  share_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed')),
  challenger_score numeric DEFAULT NULL,
  challenged_score numeric DEFAULT NULL,
  challenger_explanation text,
  challenged_explanation text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view challenges they're part of" ON public.challenges
  FOR SELECT TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);

CREATE POLICY "Users can view challenges by share code" ON public.challenges
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated users can insert challenges" ON public.challenges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Challenge participants can update" ON public.challenges
  FOR UPDATE TO authenticated
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
