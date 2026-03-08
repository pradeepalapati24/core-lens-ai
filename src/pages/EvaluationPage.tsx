import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { mockEvaluation } from "@/lib/mockData";
import { ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, BookOpen, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const rubricLabels: Record<string, string> = {
  problemUnderstanding: "Understanding",
  algorithmicThinking: "Algorithmic",
  codeQuality: "Code Quality",
  edgeCaseAwareness: "Edge Cases",
  communicationClarity: "Communication",
  domainKnowledge: "Domain",
};

export default function EvaluationPage() {
  const evaluation = mockEvaluation;

  const radarData = Object.entries(evaluation.rubric).map(([key, val]) => ({
    subject: rubricLabels[key] || key,
    score: val,
    fullMark: 10,
  }));

  const barData = Object.entries(evaluation.rubric).map(([key, val]) => ({
    name: rubricLabels[key] || key,
    score: val,
    lost: 10 - val,
  }));

  const scoreColor = evaluation.finalScore >= 7 ? "text-accent" : evaluation.finalScore >= 5 ? "text-warning" : "text-destructive";
  const hiringProb = Math.round(evaluation.finalScore * 10);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Evaluation Results</h1>
        <p className="text-muted-foreground text-sm">Binary Search Tree — Validate BST</p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="surface-elevated rounded-xl p-8 text-center">
          <div className="text-sm text-muted-foreground mb-2">Final Score</div>
          <div className={`text-6xl font-black ${scoreColor}`}>{evaluation.finalScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground mt-2">out of 10.0</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="surface-elevated rounded-xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Percent className="w-4 h-4" /> Hiring Probability
          </div>
          <div className={`text-6xl font-black ${scoreColor}`}>{hiringProb}%</div>
          <div className="text-sm text-muted-foreground mt-2">based on rubric analysis</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold mb-4">Rubric Radar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold mb-4">Score Dip Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="score" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lost" stackId="a" fill="hsl(var(--destructive) / 0.2)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm"><CheckCircle className="w-4 h-4 text-accent" /> Strengths</h3>
          <ul className="space-y-2">
            {evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-accent mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm"><AlertTriangle className="w-4 h-4 text-warning" /> Weaknesses</h3>
          <ul className="space-y-2">
            {evaluation.weaknesses.map((w, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-warning mt-0.5">•</span>{w}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm"><Lightbulb className="w-4 h-4 text-primary" /> Suggestions</h3>
          <ul className="space-y-2">
            {evaluation.suggestions.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated rounded-xl p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm"><ArrowRight className="w-4 h-4" /> Next Learning Steps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {evaluation.nextSteps.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30 text-xs">{s}</div>
          ))}
        </div>
      </motion.div>

      {/* Expert Explanation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated rounded-xl p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm"><BookOpen className="w-4 h-4 text-primary" /> Expert Explanation</h3>
        <div className="prose prose-sm max-w-none">
          {evaluation.expertExplanation.split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold mt-3 mb-2 text-foreground">{line.replace("## ", "")}</h2>;
            if (line.startsWith("```")) return null;
            if (line.startsWith("**")) return <p key={i} className="text-xs font-semibold text-foreground mb-1">{line.replace(/\*\*/g, "")}</p>;
            return <p key={i} className="text-xs text-muted-foreground mb-1">{line}</p>;
          })}
        </div>
      </motion.div>

      <div className="text-center pb-4">
        <Link to="/practice">
          <Button size="lg" className="h-11 px-8 font-semibold glow-primary">
            Practice Another Question <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
