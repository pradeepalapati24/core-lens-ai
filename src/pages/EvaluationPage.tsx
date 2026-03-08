import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { mockEvaluation } from "@/lib/mockData";
import { ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
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

  const scoreColor = evaluation.finalScore >= 7 ? "text-primary" : evaluation.finalScore >= 5 ? "text-accent" : "text-destructive";

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">Evaluation Results</h1>
          <p className="text-muted-foreground mb-8">Binary Search Tree — Validate BST</p>
        </motion.div>

        {/* Final Score */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="surface-elevated rounded-xl p-8 text-center mb-8">
          <div className="text-sm text-muted-foreground mb-2">Final Score</div>
          <div className={`text-7xl font-black ${scoreColor}`}>{evaluation.finalScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground mt-2">out of 10.0</div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold mb-4">Rubric Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Score Dip */}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><CheckCircle className="w-4 h-4 text-primary" /> Strengths</h3>
            <ul className="space-y-2">
              {evaluation.strengths.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>)}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-accent" /> Weaknesses</h3>
            <ul className="space-y-2">
              {evaluation.weaknesses.map((w, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-accent mt-0.5">•</span>{w}</li>)}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><Lightbulb className="w-4 h-4 text-info" /> Suggestions</h3>
            <ul className="space-y-2">
              {evaluation.suggestions.map((s, i) => <li key={i} className="text-sm text-muted-foreground flex items-start gap-2"><span className="text-info mt-0.5">•</span>{s}</li>)}
            </ul>
          </motion.div>
        </div>

        {/* Next Steps */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated rounded-xl p-6 mb-8">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><ArrowRight className="w-4 h-4" /> Next Learning Steps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evaluation.nextSteps.map((s, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">{s}</div>
            ))}
          </div>
        </motion.div>

        {/* Expert Explanation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated rounded-xl p-6 mb-8">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><BookOpen className="w-4 h-4 text-primary" /> Expert Explanation</h3>
          <div className="prose prose-sm max-w-none">
            {evaluation.expertExplanation.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold mt-4 mb-2 text-foreground">{line.replace("## ", "")}</h2>;
              if (line.startsWith("```")) return null;
              if (line.startsWith("**")) return <p key={i} className="text-sm font-semibold text-foreground mb-1">{line.replace(/\*\*/g, "")}</p>;
              return <p key={i} className="text-sm text-muted-foreground mb-1">{line}</p>;
            })}
          </div>
        </motion.div>

        <div className="text-center">
          <Link to="/practice">
            <Button size="lg" className="h-12 px-8 font-semibold">
              Practice Another Question <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
