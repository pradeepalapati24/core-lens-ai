import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { mockRecentEvaluations, mockDomainStrengths } from "@/lib/mockData";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const radarData = mockDomainStrengths.map((d) => ({
  subject: d.domain.split(" ").slice(0, 2).join(" "),
  score: d.score,
  fullMark: 10,
}));

export default function DashboardPage() {
  const weakAreas = mockDomainStrengths.filter((d) => d.score < 7).sort((a, b) => a.score - b.score);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground mb-8">Your learning intelligence at a glance</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated rounded-xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Target className="w-4 h-4" /> Overall Score
            </div>
            <div className="text-5xl font-black text-gradient-primary">7.1</div>
            <p className="text-sm text-muted-foreground mt-1">Across 5 evaluations</p>
          </motion.div>

          {/* Strongest */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated rounded-xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <TrendingUp className="w-4 h-4" /> Top Domain
            </div>
            <div className="text-2xl font-bold">System Design</div>
            <p className="text-sm text-primary mt-1">Score: 8.1 / 10</p>
          </motion.div>

          {/* Weakest */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated rounded-xl p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <AlertTriangle className="w-4 h-4" /> Needs Improvement
            </div>
            <div className="text-2xl font-bold">Operating Systems</div>
            <p className="text-sm text-accent mt-1">Score: 5.9 / 10</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold mb-4">Domain Strengths</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold mb-4">Score by Domain</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockDomainStrengths}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="domain" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} angle={-30} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Evaluations */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Evaluations</h3>
            <Link to="/practice" className="text-sm text-primary hover:underline flex items-center gap-1">
              Practice More <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockRecentEvaluations.map((e) => (
              <Link to="/evaluation" key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <span className="font-medium">{e.topic}</span>
                  <span className="text-sm text-muted-foreground ml-2">{e.domain}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{e.date}</span>
                  <span className={`font-mono font-bold ${e.score >= 7 ? "text-primary" : e.score >= 5 ? "text-accent" : "text-destructive"}`}>
                    {e.score.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
