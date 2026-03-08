import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { mockEvaluation } from "@/lib/mockData";
import { ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, BookOpen, Percent, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const rubricLabels: Record<string, string> = {
  understanding: "Understanding",
  algorithmicThinking: "Algorithmic",
  codeQuality: "Code Quality",
  edgeCases: "Edge Cases",
  communication: "Communication",
  domainKnowledge: "Domain",
  // Legacy mappings
  problemUnderstanding: "Understanding",
  edgeCaseAwareness: "Edge Cases",
  communicationClarity: "Communication",
};

export default function EvaluationPage() {
  const location = useLocation();
  const state = location.state as any;

  // Use AI evaluation if available, otherwise fallback to mock
  const aiEvaluation = state?.evaluation;
  
  // Build evaluation object from AI response or mock
  const evaluation = aiEvaluation ? {
    finalScore: aiEvaluation.finalScore || 0,
    rubric: aiEvaluation.scores || {},
    strengths: aiEvaluation.strengths || [],
    weaknesses: aiEvaluation.weaknesses || [],
    suggestions: aiEvaluation.improvements || [],
    nextSteps: aiEvaluation.improvements?.slice(0, 4) || [],
    expertExplanation: aiEvaluation.expertExplanation || aiEvaluation.overallFeedback || "",
    hiringProbability: aiEvaluation.hiringProbability || 0,
    interviewReadiness: aiEvaluation.interviewReadinessScore || 0,
  } : mockEvaluation;

  const rubric = aiEvaluation?.scores || evaluation.rubric || {};

  const radarData = Object.entries(rubric).map(([key, val]) => ({
    subject: rubricLabels[key] || key,
    score: val as number,
    fullMark: 10,
  }));

  const barData = Object.entries(rubric).map(([key, val]) => ({
    name: rubricLabels[key] || key,
    score: val as number,
    lost: 10 - (val as number),
  }));

  const finalScore = aiEvaluation?.finalScore ?? evaluation.finalScore ?? 0;
  const scoreColor = finalScore >= 7 ? "text-accent" : finalScore >= 5 ? "text-warning" : "text-destructive";
  const hiringProb = aiEvaluation?.hiringProbability ?? Math.round(finalScore * 10);

  const questionTitle = state?.question?.topic || "Evaluation";
  const questionSubtopic = state?.question?.subtopic || "Results";

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <Link to="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Evaluation Results</h1>
        <p className="text-sm text-muted-foreground">{state?.domain || questionTitle} — {state?.topic || questionSubtopic}</p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-6 text-center">
          <div className="text-xs text-muted-foreground mb-2">Final Score</div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{finalScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 10.0</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Percent className="w-3.5 h-3.5" /> Hiring Probability
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{hiringProb}%</div>
          <div className="text-xs text-muted-foreground mt-1">based on rubric analysis</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Target className="w-3.5 h-3.5" /> Interview Readiness
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{(aiEvaluation?.interviewReadinessScore ?? finalScore).toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">readiness score</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Rubric Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Score Dip Analysis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="score" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lost" stackId="a" fill="hsl(var(--destructive) / 0.15)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Overall Feedback */}
      {aiEvaluation?.overallFeedback && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="surface-elevated p-5">
          <h3 className="text-sm font-medium mb-3">Overall Feedback</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiEvaluation.overallFeedback}</p>
        </motion.div>
      )}

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Strengths</h3>
          <ul className="space-y-1.5">
            {(evaluation.strengths || []).map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-accent mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><AlertTriangle className="w-3.5 h-3.5 text-warning" /> Weaknesses</h3>
          <ul className="space-y-1.5">
            {(evaluation.weaknesses || []).map((w: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-warning mt-0.5">•</span>{w}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Improvements</h3>
          <ul className="space-y-1.5">
            {(evaluation.suggestions || []).map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>
      </div>

      {/* Expert Explanation */}
      {evaluation.expertExplanation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><BookOpen className="w-3.5 h-3.5 text-primary" /> Expert Explanation</h3>
          <div className="prose prose-sm max-w-none">
            {evaluation.expertExplanation.split("\n").map((line: string, i: number) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold mt-3 mb-1.5 text-foreground">{line.replace("## ", "")}</h2>;
              if (line.startsWith("```")) return null;
              if (line.startsWith("**")) return <p key={i} className="text-xs font-medium text-foreground mb-1">{line.replace(/\*\*/g, "")}</p>;
              return <p key={i} className="text-xs text-muted-foreground mb-1">{line}</p>;
            })}
          </div>
        </motion.div>
      )}

      <div className="text-center pb-4">
        <Link to="/domains">
          <Button size="lg" className="h-9 px-6 text-sm font-medium">
            Practice Another Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
