import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Flame, Percent, Code2, Loader2 } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDomainPerformance, useTopicPerformance, getStrongWeakDomains } from "@/hooks/useUserPerformance";
import { useDomains } from "@/hooks/useDomains";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [solvedQuestions, setSolvedQuestions] = useState<any[]>([]);

  const { data: domains = [] } = useDomains();
  const { data: domainPerformance = [], isLoading: domainPerfLoading } = useDomainPerformance(userId);
  const { data: topicPerformance = [] } = useTopicPerformance(userId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Fetch recent solved questions
        const { data: solved } = await supabase
          .from("user_solved_questions")
          .select(`
            *,
            questions:question_id (
              question_text,
              difficulty,
              domains:domain_id (name),
              topics:topic_id (name)
            )
          `)
          .eq("user_id", user.id)
          .order("solved_at", { ascending: false })
          .limit(5);
        
        setSolvedQuestions(solved || []);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Calculate metrics
  const totalSolved = domainPerformance.reduce((sum, p) => sum + p.total_questions, 0);
  const avgScore = domainPerformance.length > 0
    ? domainPerformance.reduce((sum, p) => sum + (p.avg_score * p.total_questions), 0) / Math.max(totalSolved, 1)
    : 0;
  
  // Interview readiness (avg score)
  const interviewReadiness = avgScore.toFixed(1);
  
  // Hiring probability (simplified calculation based on avg score)
  const hiringProbability = Math.min(Math.round(avgScore * 10), 100);
  
  // Streak (placeholder - would need to track daily activity)
  const currentStreak = solvedQuestions.length > 0 ? 1 : 0;

  // Radar chart data
  const radarData = domainPerformance.map((d) => ({
    subject: d.domain_name.split(" ").slice(0, 2).join(" "),
    score: d.avg_score,
    fullMark: 10,
  }));

  // Get weak domains for heatmap
  const { weak: weakDomains } = getStrongWeakDomains(domainPerformance);
  const heatmapData = [...domainPerformance].sort((a, b) => a.avg_score - b.avg_score);

  // Recommendations based on weak areas
  const recommendations = [...weakDomains.slice(0, 3)];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-[28px] font-semibold mb-2">Welcome to CoreLens</h1>
        <p className="text-muted-foreground mb-6">Sign in to track your progress and view your dashboard.</p>
        <Link to="/auth" className="text-primary hover:underline">
          Sign In →
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your learning intelligence at a glance</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Interview Readiness", value: interviewReadiness, sub: "out of 10", color: "text-primary" },
          { icon: Percent, label: "Hiring Probability", value: `${hiringProbability}%`, sub: "based on rubric", color: "text-accent" },
          { icon: Code2, label: "Questions Solved", value: totalSolved.toString(), sub: "total", color: "text-foreground" },
          { icon: Flame, label: "Current Streak", value: currentStreak.toString(), sub: "consecutive days", color: "text-warning" },
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
          {radarData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              Complete some questions to see your skill radar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Weak Topics Heatmap */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Domain Performance</h3>
          {heatmapData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
              No performance data yet
            </div>
          ) : (
            <div className="space-y-3">
              {heatmapData.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="text-lg">{d.domain_icon}</span>
                  <span className="text-xs w-28 truncate text-muted-foreground">{d.domain_name}</span>
                  <div className="flex-1 h-5 rounded bg-muted/20 overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${d.avg_score * 10}%`,
                        backgroundColor: d.avg_score < 6 ? "hsl(var(--destructive))" : d.avg_score < 7.5 ? "hsl(var(--warning))" : "hsl(var(--accent))",
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs w-8 text-right text-muted-foreground">{d.avg_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Evaluations */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Recent Evaluations</h3>
            <Link to="/profile" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {solvedQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No evaluations yet. Start practicing!
            </div>
          ) : (
            <div className="space-y-1">
              {solvedQuestions.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                  <div>
                    <span className="text-sm font-medium">{e.questions?.topics?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground ml-2">{e.questions?.domains?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(e.solved_at).toLocaleDateString()}
                    </span>
                    <span className={`font-mono text-xs font-semibold ${
                      e.score >= 7 ? "text-accent" : e.score >= 5 ? "text-warning" : "text-destructive"
                    }`}>
                      {Number(e.score).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recommended */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Recommended Practice</h3>
          {recommendations.length === 0 ? (
            <div className="space-y-2">
              {domains.slice(0, 3).map((d) => (
                <Link to="/practice" key={d.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.icon}</span>
                    <span className="text-sm font-medium">{d.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    d.type === "software" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}>
                    {d.type}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recommendations.map((r) => (
                <Link to="/practice" key={r.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{r.domain_icon}</span>
                    <div>
                      <span className="text-sm font-medium">{r.domain_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">Needs improvement</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-destructive">{r.avg_score.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
