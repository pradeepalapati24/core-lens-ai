import { motion } from "framer-motion";
import { mockDomainStrengths, mockRecentEvaluations } from "@/lib/mockData";
import { User, TrendingUp, BookOpen, Code2 } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const progressData = [
  { date: "Mar 1", score: 5.2 },
  { date: "Mar 2", score: 5.8 },
  { date: "Mar 3", score: 5.9 },
  { date: "Mar 4", score: 7.0 },
  { date: "Mar 5", score: 8.1 },
  { date: "Mar 6", score: 6.8 },
  { date: "Mar 7", score: 7.35 },
];

const radarData = mockDomainStrengths.map((d) => ({
  subject: d.domain.split(" ").slice(0, 2).join(" "),
  score: d.score,
  fullMark: 10,
}));

export default function ProfilePage() {
  const totalSolved = mockRecentEvaluations.length;
  const avgScore = (mockRecentEvaluations.reduce((a, b) => a + b.score, 0) / totalSolved).toFixed(1);

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Profile Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your learning journey</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Student User</h2>
          <p className="text-xs text-muted-foreground">5 domains practiced · {totalSolved} questions solved</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: User, label: "Overall Score", value: avgScore, sub: "avg across all" },
          { icon: Code2, label: "Solved", value: totalSolved.toString(), sub: "total questions" },
          { icon: TrendingUp, label: "Best Domain", value: "System Design", sub: "8.1 / 10" },
          { icon: BookOpen, label: "Streak", value: "5 days", sub: "current streak" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 + 0.1 }} className="surface-elevated p-[18px]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5"><s.icon className="w-3.5 h-3.5" />{s.label}</div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Interview Readiness Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Domain Strength Chart</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weak Topics */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6">
        <h3 className="text-sm font-medium mb-4">Weak Topic Heatmap</h3>
        <div className="space-y-2.5">
          {mockDomainStrengths.sort((a, b) => a.score - b.score).map((d) => (
            <div key={d.domain} className="flex items-center gap-3">
              <span className="text-xs w-32 truncate text-muted-foreground">{d.domain}</span>
              <div className="flex-1 flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 flex-1 rounded-sm"
                    style={{
                      backgroundColor: i < Math.round(d.score)
                        ? d.score < 6 ? "hsl(var(--destructive))" : d.score < 7.5 ? "hsl(var(--warning))" : "hsl(var(--accent))"
                        : "hsl(var(--muted) / 0.5)",
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs w-8 text-right text-muted-foreground">{d.score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Evaluation History */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated p-6">
        <h3 className="text-sm font-medium mb-4">Evaluation History</h3>
        <div className="space-y-1">
          {mockRecentEvaluations.map((e) => (
            <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
              <div>
                <span className="text-sm font-medium">{e.topic}</span>
                <span className="text-xs text-muted-foreground ml-2">{e.domain}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{e.date}</span>
                <span className={`font-mono text-xs font-semibold ${e.score >= 7 ? "text-accent" : "text-warning"}`}>
                  {e.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
