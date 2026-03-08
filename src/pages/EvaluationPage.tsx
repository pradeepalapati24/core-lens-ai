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
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <Link to="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Evaluation Results</h1>
        <p className="text-sm text-muted-foreground">Binary Search Tree — Validate BST</p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-6 text-center">
          <div className="text-xs text-muted-foreground mb-2">Final Score</div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{evaluation.finalScore.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 10.0</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Percent className="w-3.5 h-3.5" /> Hiring Probability
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{hiringProb}%</div>
          <div className="text-xs text-muted-foreground mt-1">based on rubric analysis</div>
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

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5 text-accent" /> Strengths</h3>
          <ul className="space-y-1.5">
            {evaluation.strengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-accent mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><AlertTriangle className="w-3.5 h-3.5 text-warning" /> Weaknesses</h3>
          <ul className="space-y-1.5">
            {evaluation.weaknesses.map((w, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-warning mt-0.5">•</span>{w}</li>)}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Suggestions</h3>
          <ul className="space-y-1.5">
            {evaluation.suggestions.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>
      </div>

      {/* Next Steps */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated p-5">
        <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><ArrowRight className="w-3.5 h-3.5" /> Next Learning Steps</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {evaluation.nextSteps.map((s, i) => (
            <div key={i} className="p-2.5 rounded-md bg-muted/20 text-xs text-muted-foreground">{s}</div>
          ))}
        </div>
      </motion.div>

      {/* Expert Explanation */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated p-5">
        <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><BookOpen className="w-3.5 h-3.5 text-primary" /> Expert Explanation</h3>
        <div className="prose prose-sm max-w-none">
          {evaluation.expertExplanation.split("\n").map((line, i) => {
            if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold mt-3 mb-1.5 text-foreground">{line.replace("## ", "")}</h2>;
            if (line.startsWith("```")) return null;
            if (line.startsWith("**")) return <p key={i} className="text-xs font-medium text-foreground mb-1">{line.replace(/\*\*/g, "")}</p>;
            return <p key={i} className="text-xs text-muted-foreground mb-1">{line}</p>;
          })}
        </div>
      </motion.div>

      <div className="text-center pb-4">
        <Link to="/practice">
          <Button size="lg" className="h-9 px-6 text-sm font-medium">
            Practice Another Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
