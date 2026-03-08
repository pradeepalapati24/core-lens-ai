import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, AlertTriangle, Target, Flame, Percent } from "lucide-react";
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
  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your learning intelligence at a glance</p>
      </motion.div>

      {/* Top metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-glow rounded-xl p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Target className="w-4 h-4 text-primary" /> Interview Readiness
          </div>
          <div className="text-4xl font-black text-gradient-primary">7.1</div>
          <p className="text-sm text-muted-foreground mt-1">out of 10</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glow rounded-xl p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Percent className="w-4 h-4 text-accent" /> Hiring Probability
          </div>
          <div className="text-4xl font-black text-accent">68%</div>
          <p className="text-sm text-muted-foreground mt-1">based on rubric scores</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-glow rounded-xl p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Flame className="w-4 h-4 text-warning" /> Streak
          </div>
          <div className="text-4xl font-black text-warning">5</div>
          <p className="text-sm text-muted-foreground mt-1">consecutive days</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold mb-4">Radar Skill Graph</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weak Topic Heatmap */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold mb-4">Weak Topic Heatmap</h3>
          <div className="space-y-3">
            {mockDomainStrengths.sort((a, b) => a.score - b.score).map((d) => (
              <div key={d.domain} className="flex items-center gap-3">
                <span className="text-sm w-36 truncate text-muted-foreground">{d.domain}</span>
                <div className="flex-1 h-6 rounded bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${d.score * 10}%`,
                      backgroundColor: d.score < 6 ? "hsl(var(--destructive))" : d.score < 7.5 ? "hsl(var(--warning))" : "hsl(var(--accent))",
                    }}
                  />
                </div>
                <span className="font-mono text-sm w-10 text-right">{d.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Evaluations */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Evaluations</h3>
            <Link to="/practice" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {mockRecentEvaluations.map((e) => (
              <Link to="/evaluation" key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <span className="font-medium text-sm">{e.topic}</span>
                  <span className="text-xs text-muted-foreground ml-2">{e.domain}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                  <span className={`font-mono text-sm font-bold ${e.score >= 7 ? "text-accent" : e.score >= 5 ? "text-warning" : "text-destructive"}`}>
                    {e.score.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recommended */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold mb-4">Recommended Questions</h3>
          <div className="space-y-3">
            {[
              { topic: "Process Scheduling", domain: "Operating Systems", difficulty: "beginner" },
              { topic: "Graph BFS/DFS", domain: "Data Structures", difficulty: "intermediate" },
              { topic: "Load Balancing", domain: "System Design", difficulty: "advanced" },
            ].map((q, i) => (
              <Link to="/practice" key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                <div>
                  <span className="font-medium text-sm">{q.topic}</span>
                  <span className="text-xs text-muted-foreground ml-2">{q.domain}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  q.difficulty === "beginner" ? "bg-accent/10 text-accent" :
                  q.difficulty === "intermediate" ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {q.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
