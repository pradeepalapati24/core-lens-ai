import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Flame, TrendingUp, Code2, Loader2, Sparkles, Swords, Clock } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDomainPerformance, useTopicPerformance, getStrongWeakDomains } from "@/hooks/useUserPerformance";
import { useDomains } from "@/hooks/useDomains";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [solvedQuestions, setSolvedQuestions] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState("");

  const { data: domains = [] } = useDomains();
  const { data: domainPerformance = [] } = useDomainPerformance(userId);
  const { data: topicPerformance = [] } = useTopicPerformance(userId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase.from("profiles").select("display_name, username").eq("id", user.id).single();
        setDisplayName(profile?.display_name || profile?.username || user.email?.split("@")[0] || "");
        const { data: solved } = await supabase
          .from("user_solved_questions")
          .select(`*, questions:question_id (question_text, difficulty, domains:domain_id (name), topics:topic_id (name))`)
          .eq("user_id", user.id)
          .order("solved_at", { ascending: false })
          .limit(5);
        setSolvedQuestions(solved || []);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const totalSolved = domainPerformance.reduce((sum, p) => sum + p.total_questions, 0);
  const avgScoreRaw = domainPerformance.length > 0
    ? domainPerformance.reduce((sum, p) => sum + (p.avg_score * p.total_questions), 0) / Math.max(totalSolved, 1)
    : 0;
  const avgScore = avgScoreRaw * 10;
  const interviewReadiness = Math.round(avgScore);
  const hiringProbability = Math.min(Math.round(avgScore), 100);
  const currentStreak = solvedQuestions.length > 0 ? 1 : 0;

  const radarData = domainPerformance.map((d) => ({
    subject: d.domain_name.split(" ").slice(0, 2).join(" "),
    score: d.avg_score * 10,
    fullMark: 100,
  }));

  const { weak: weakDomains } = getStrongWeakDomains(domainPerformance);
  const heatmapData = [...domainPerformance].sort((a, b) => a.avg_score - b.avg_score);
  const recommendations = [...weakDomains.slice(0, 3)];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to CoreLens</h1>
        <p className="text-muted-foreground text-sm mb-6">Sign in to track your progress and unlock your learning intelligence dashboard.</p>
        <Link to="/auth">
          <Button className="h-10 px-6">Sign In <ArrowRight className="w-4 h-4 ml-1.5" /></Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <OnboardingFlow userId={userId} hasSolvedQuestions={solvedQuestions.length > 0} />
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-0.5">
          Welcome back, {displayName.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">Here's your learning intelligence overview</p>
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-3 flex-wrap">
        <Link to="/practice">
          <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium">
            <Code2 className="w-3.5 h-3.5" /> Start Practice
          </Button>
        </Link>
        <Link to="/practice">
          <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Interview Sim
          </Button>
        </Link>
        <Link to="/challenge">
          <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-medium">
            <Swords className="w-3.5 h-3.5" /> Challenge Friend
          </Button>
        </Link>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Interview Readiness", value: interviewReadiness.toString(), sub: "/100", color: "text-primary", bgColor: "bg-primary/8" },
          { icon: TrendingUp, label: "Hiring Probability", value: `${hiringProbability}%`, sub: "based on rubric", color: "text-success", bgColor: "bg-success/8" },
          { icon: Code2, label: "Questions Solved", value: totalSolved.toString(), sub: "total", color: "text-foreground", bgColor: "bg-muted" },
          { icon: Flame, label: "Current Streak", value: currentStreak.toString(), sub: "days", color: "text-warning", bgColor: "bg-warning/8" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * i + 0.1 }} className="surface-elevated p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${m.bgColor} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-5 surface-elevated p-6">
          <h3 className="text-sm font-semibold mb-1">Skill Radar</h3>
          <p className="text-xs text-muted-foreground mb-4">Domain proficiency overview</p>
          {radarData.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Complete questions to see your radar</p>
              <Link to="/practice" className="text-xs text-primary hover:underline mt-2">Start practicing →</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.12} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Domain Performance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-7 surface-elevated p-6">
          <h3 className="text-sm font-semibold mb-1">Domain Performance</h3>
          <p className="text-xs text-muted-foreground mb-4">Score breakdown by domain</p>
          {heatmapData.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No performance data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {heatmapData.map((d) => {
                const score = d.avg_score * 10;
                return (
                  <div key={d.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{d.domain_icon}</span>
                        <span className="text-sm font-medium">{d.domain_name}</span>
                      </div>
                      <span className={`font-mono text-sm font-semibold ${score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-destructive"}`}>
                        {Math.round(score)}
                      </span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Evaluations */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Your last evaluations</p>
            </div>
            <Link to="/profile" className="text-xs text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {solvedQuestions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">No evaluations yet</p>
              <Link to="/practice">
                <Button variant="outline" size="sm" className="text-xs">Start practicing</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {solvedQuestions.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">{e.questions?.topics?.name || "Unknown"}</span>
                    <span className="text-[11px] text-muted-foreground">{e.questions?.domains?.name} · {new Date(e.solved_at).toLocaleDateString()}</span>
                  </div>
                  <span className={`font-mono text-sm font-bold ml-4 ${
                    (e.score || 0) * 10 >= 70 ? "text-success" : (e.score || 0) * 10 >= 50 ? "text-warning" : "text-destructive"
                  }`}>
                    {Math.round(Number(e.score || 0) * 10)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recommended */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Recommended For You</h3>
            <p className="text-xs text-muted-foreground">Based on your weak areas</p>
          </div>
          {recommendations.length === 0 ? (
            <div className="space-y-2">
              {domains.slice(0, 4).map((d) => (
                <Link to="/practice" key={d.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{d.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{d.name}</span>
                      <span className={`text-[10px] ml-2 px-1.5 py-0.5 rounded font-medium ${
                        d.type === "software" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                      }`}>{d.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recommendations.map((r) => (
                <Link to="/practice" key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{r.domain_icon}</span>
                    <div>
                      <span className="text-sm font-medium">{r.domain_name}</span>
                      <span className="text-[10px] text-destructive ml-2">Needs work</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
