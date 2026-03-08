-- Create difficulty enum
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create domain type enum
CREATE TYPE public.domain_type AS ENUM ('core', 'software');

-- Create domains table
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type domain_type NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(domain_id, name)
);

-- Create subtopics table
CREATE TABLE public.subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(topic_id, name)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  subtopic_id UUID NOT NULL REFERENCES public.subtopics(id) ON DELETE CASCADE,
  difficulty difficulty_level NOT NULL,
  question_text TEXT NOT NULL,
  learning_context TEXT,
  hints TEXT[] DEFAULT '{}',
  expected_concepts TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_solved_questions table to track which questions users have solved
CREATE TABLE public.user_solved_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  score NUMERIC(4,2),
  solved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Create user_performance table for analytics at domain/topic/subtopic levels
CREATE TABLE public.user_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  subtopic_id UUID REFERENCES public.subtopics(id) ON DELETE CASCADE,
  total_questions INTEGER DEFAULT 0,
  correct_questions INTEGER DEFAULT 0,
  avg_score NUMERIC(4,2) DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_topics_domain ON public.topics(domain_id);
CREATE INDEX idx_subtopics_topic ON public.subtopics(topic_id);
CREATE INDEX idx_questions_domain ON public.questions(domain_id);
CREATE INDEX idx_questions_topic ON public.questions(topic_id);
CREATE INDEX idx_questions_subtopic ON public.questions(subtopic_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_user_solved_user ON public.user_solved_questions(user_id);
CREATE INDEX idx_user_performance_user ON public.user_performance(user_id);

-- Enable RLS on all tables
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_solved_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_performance ENABLE ROW LEVEL SECURITY;

-- Domains, topics, subtopics, questions are publicly readable
CREATE POLICY "Domains are viewable by everyone" ON public.domains FOR SELECT USING (true);
CREATE POLICY "Topics are viewable by everyone" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Subtopics are viewable by everyone" ON public.subtopics FOR SELECT USING (true);
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);

-- User solved questions policies
CREATE POLICY "Users can view own solved questions" ON public.user_solved_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own solved questions" ON public.user_solved_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own solved questions" ON public.user_solved_questions FOR UPDATE USING (auth.uid() = user_id);

-- User performance policies
CREATE POLICY "Users can view own performance" ON public.user_performance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own performance" ON public.user_performance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own performance" ON public.user_performance FOR UPDATE USING (auth.uid() = user_id);