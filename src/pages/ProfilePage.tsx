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
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">Profile Analytics</h1>
          <p className="text-muted-foreground mb-8">Track your learning journey</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: User, label: "Overall Score", value: avgScore, sub: "avg across all" },
            { icon: Code2, label: "Solved", value: totalSolved.toString(), sub: "total questions" },
            { icon: TrendingUp, label: "Best Domain", value: "System Design", sub: "8.1 / 10" },
            { icon: BookOpen, label: "Streak", value: "5 days", sub: "current streak" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-elevated rounded-xl p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><s.icon className="w-4 h-4" />{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Progress */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold mb-4">Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Domain Radar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated rounded-xl p-6">
            <h3 className="font-semibold mb-4">Domain Skills</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Weak Topics */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Weak Topics — Focus Areas</h3>
          <div className="space-y-3">
            {mockDomainStrengths.filter(d => d.score < 7).sort((a, b) => a.score - b.score).map((d) => (
              <div key={d.domain} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="font-medium">{d.domain}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${d.score * 10}%` }} />
                  </div>
                  <span className="font-mono text-sm text-accent">{d.score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Evaluation History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated rounded-xl p-6">
          <h3 className="font-semibold mb-4">Evaluation History</h3>
          <div className="space-y-2">
            {mockRecentEvaluations.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <span className="font-medium">{e.topic}</span>
                  <span className="text-sm text-muted-foreground ml-2">{e.domain}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{e.date}</span>
                  <span className={`font-mono font-bold ${e.score >= 7 ? "text-primary" : "text-accent"}`}>
                    {e.score.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
