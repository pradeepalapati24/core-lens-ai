export type DomainCategory = "core" | "it";

export interface Domain {
  id: string;
  name: string;
  category: DomainCategory;
  icon: string;
  description: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  name: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Question {
  id: string;
  domain: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  questionText: string;
  learningContext: string;
  hints: string[];
  createdAt: string;
}

export interface RubricScores {
  problemUnderstanding: number;
  algorithmicThinking: number;
  codeQuality: number;
  edgeCaseAwareness: number;
  communicationClarity: number;
  domainKnowledge: number;
}

export interface Evaluation {
  id: string;
  questionId: string;
  finalScore: number;
  rubric: RubricScores;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  nextSteps: string[];
  expertExplanation: string;
  createdAt: string;
}

export interface Submission {
  code: string;
  explanation: string;
  questionId: string;
}

export function calculateFinalScore(r: RubricScores): number {
  return (
    r.problemUnderstanding * 0.2 +
    r.algorithmicThinking * 0.2 +
    r.codeQuality * 0.15 +
    r.edgeCaseAwareness * 0.15 +
    r.communicationClarity * 0.15 +
    r.domainKnowledge * 0.15
  );
}
