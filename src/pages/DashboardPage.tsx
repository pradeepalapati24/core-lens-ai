import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Flame, Percent, Code2 } from "lucide-react";
import { mockRecentEvaluations, mockDomainStrengths } from "@/lib/mockData";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";

const radarData = mockDomainStrengths.map((d) => ({
  subject: d.domain.split(" ").slice(0, 2).join(" "),
  score: d.score,
  fullMark: 10,
}));

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your learning intelligence at a glance</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Interview Readiness", value: "7.1", sub: "out of 10", color: "text-primary" },
          { icon: Percent, label: "Hiring Probability", value: "68%", sub: "based on rubric", color: "text-accent" },
          { icon: Code2, label: "Questions Solved", value: "24", sub: "total", color: "text-foreground" },
          { icon: Flame, label: "Current Streak", value: "5", sub: "consecutive days", color: "text-warning" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="surface-elevated p-[18px]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <m.icon className="w-3.5 h-3.5" /> {m.label}
            </div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weak Topics */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Weak Topic Heatmap</h3>
          <div className="space-y-3">
            {mockDomainStrengths.sort((a, b) => a.score - b.score).map((d) => (
              <div key={d.domain} className="flex items-center gap-3">
                <span className="text-xs w-32 truncate text-muted-foreground">{d.domain}</span>
                <div className="flex-1 h-5 rounded bg-muted/20 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${d.score * 10}%`,
                      backgroundColor: d.score < 6 ? "hsl(var(--destructive))" : d.score < 7.5 ? "hsl(var(--warning))" : "hsl(var(--accent))",
                    }}
                  />
                </div>
                <span className="font-mono text-xs w-8 text-right text-muted-foreground">{d.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Evaluations */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Recent Evaluations</h3>
            <Link to="/practice" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {mockRecentEvaluations.map((e) => (
              <Link to="/evaluation" key={e.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                <div>
                  <span className="text-sm font-medium">{e.topic}</span>
                  <span className="text-xs text-muted-foreground ml-2">{e.domain}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                  <span className={`font-mono text-xs font-semibold ${e.score >= 7 ? "text-accent" : e.score >= 5 ? "text-warning" : "text-destructive"}`}>
                    {e.score.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recommended */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Recommended Questions</h3>
          <div className="space-y-2">
            {[
              { topic: "Process Scheduling", domain: "Operating Systems", difficulty: "beginner" },
              { topic: "Graph BFS/DFS", domain: "Data Structures", difficulty: "intermediate" },
              { topic: "Load Balancing", domain: "System Design", difficulty: "advanced" },
            ].map((q, i) => (
              <Link to="/practice" key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                <div>
                  <span className="text-sm font-medium">{q.topic}</span>
                  <span className="text-xs text-muted-foreground ml-2">{q.domain}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
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
