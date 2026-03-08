import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, TrendingUp, BookOpen, Code2, Target, AlertTriangle, Lightbulb, Loader2 } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDomainPerformance, useTopicPerformance, getStrongWeakDomains, getStrongWeakTopics } from "@/hooks/useUserPerformance";
import { useDomains } from "@/hooks/useDomains";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { data: domains = [] } = useDomains();
  const { data: domainPerformance = [], isLoading: domainPerfLoading } = useDomainPerformance(userId);
  const { data: topicPerformance = [], isLoading: topicPerfLoading } = useTopicPerformance(userId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || null);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", user.id)
          .single();
        
        setDisplayName(profile?.display_name || profile?.username || user.email?.split("@")[0] || "User");
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { strong: strongDomains, weak: weakDomains, recommendations } = getStrongWeakAreas(domainPerformance);
  const { strong: strongTopics, weak: weakTopics } = getStrongWeakAreas(topicPerformance);

  // Calculate aggregate stats
  const totalSolved = domainPerformance.reduce((sum, p) => sum + p.total_questions, 0);
  const avgScore = domainPerformance.length > 0
    ? (domainPerformance.reduce((sum, p) => sum + (p.avg_score * p.total_questions), 0) / Math.max(totalSolved, 1)).toFixed(1)
    : "0.0";

  // Prepare radar chart data
  const radarData = domainPerformance.map((d) => ({
    subject: d.domain_name.split(" ").slice(0, 2).join(" "),
    score: d.avg_score,
    fullMark: 10,
  }));

  // Topic bar chart data (top 10 by questions solved)
  const topicBarData = [...topicPerformance]
    .sort((a, b) => b.total_questions - a.total_questions)
    .slice(0, 10)
    .map((t) => ({
      name: t.topic_name,
      score: t.avg_score,
      questions: t.total_questions,
    }));

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
        <p className="text-muted-foreground">Please sign in to view your profile analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Profile Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your learning journey across domains, topics, and subtopics</p>
      </motion.div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{displayName}</h2>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: User, label: "Overall Score", value: avgScore, sub: "avg across all", color: "text-primary" },
          { icon: Code2, label: "Questions Solved", value: totalSolved.toString(), sub: "total completed", color: "text-accent" },
          { icon: TrendingUp, label: "Domains Practiced", value: domainPerformance.length.toString(), sub: `of ${domains.length} total`, color: "text-warning" },
          { icon: BookOpen, label: "Topics Covered", value: topicPerformance.length.toString(), sub: "unique topics", color: "text-destructive" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 + 0.1 }} className="surface-elevated p-[18px]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />{s.label}
            </div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Strong & Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Domains */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium">Strong Domains</h3>
          </div>
          {strongDomains.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete more questions to identify your strengths.</p>
          ) : (
            <div className="space-y-2">
              {strongDomains.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.domain_icon}</span>
                    <span className="text-sm font-medium">{d.domain_name}</span>
                  </div>
                  <span className="text-sm font-mono text-accent">{d.avg_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weak Domains */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-medium">Weak Domains</h3>
          </div>
          {weakDomains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weak domains identified yet. Keep practicing!</p>
          ) : (
            <div className="space-y-2">
              {weakDomains.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.domain_icon}</span>
                    <span className="text-sm font-medium">{d.domain_name}</span>
                  </div>
                  <span className="text-sm font-mono text-destructive">{d.avg_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Strong & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-medium">Strong Topics</h3>
          </div>
          {strongTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete more questions to identify strong topics.</p>
          ) : (
            <div className="space-y-2">
              {strongTopics.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm font-medium">{t.topic_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.domain_name}</span>
                  </div>
                  <span className="text-sm font-mono text-accent">{t.avg_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weak Topics */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-medium">Weak Topics</h3>
          </div>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weak topics identified yet.</p>
          ) : (
            <div className="space-y-2">
              {weakTopics.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm font-medium">{t.topic_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.domain_name}</span>
                  </div>
                  <span className="text-sm font-mono text-warning">{t.avg_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recommended Topics */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Recommended Topics to Practice</h3>
        </div>
      {weakDomains.length === 0 && weakTopics.length === 0 ? (
        <p className="text-sm text-muted-foreground">Start practicing to get personalized recommendations!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {weakDomains.slice(0, 3).map((d) => (
            <div key={d.id} className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{d.domain_icon}</span>
                <span className="text-sm font-medium">{d.domain_name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current score: {d.avg_score.toFixed(1)} · {d.total_questions} questions
              </p>
            </div>
          ))}
          {weakTopics.slice(0, 2).map((t: any) => (
            <div key={t.id} className="p-4 rounded-lg border border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{t.topic_name}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.domain_name} · Score: {t.avg_score.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      )}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Radar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Domain Strength Radar</h3>
          {radarData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              No domain data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Topic Performance Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Topic Performance</h3>
          {topicBarData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              No topic data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topicBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
