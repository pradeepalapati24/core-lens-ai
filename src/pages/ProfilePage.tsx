import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, TrendingUp, BookOpen, Code2, Target, AlertTriangle, Lightbulb, Loader2, ArrowRight, Star, Zap, BarChart3 } from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useDomainPerformance, useTopicPerformance, getStrongWeakDomains, getStrongWeakTopics } from "@/hooks/useUserPerformance";
import { useDomains } from "@/hooks/useDomains";
import { Progress } from "@/components/ui/progress";

// Level thresholds
const LEVELS = [
  { name: "Beginner", minScore: 0, maxScore: 4, color: "text-muted-foreground", bg: "bg-muted" },
  { name: "Intermediate", minScore: 4, maxScore: 7, color: "text-warning", bg: "bg-warning" },
  { name: "Advanced", minScore: 7, maxScore: 9, color: "text-primary", bg: "bg-primary" },
  { name: "Expert", minScore: 9, maxScore: 10, color: "text-success", bg: "bg-success" },
];

function getLevel(score: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) return LEVELS[i];
  }
  return LEVELS[0];
}

function getNextLevel(score: number) {
  for (const level of LEVELS) {
    if (score < level.maxScore) return level;
  }
  return LEVELS[LEVELS.length - 1];
}

function getPointsToNext(score: number) {
  const next = getNextLevel(score);
  const pointsNeeded = Math.max(0, next.maxScore - score);
  return { pointsNeeded: pointsNeeded.toFixed(1), nextLevel: next.name };
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const { data: domains = [] } = useDomains();
  const { data: domainPerformance = [] } = useDomainPerformance(userId);
  const { data: topicPerformance = [] } = useTopicPerformance(userId);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || null);
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username, points")
          .eq("id", user.id)
          .single();
        
        setDisplayName(profile?.display_name || profile?.username || user.email?.split("@")[0] || "User");
        setPoints(profile?.points || 0);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const { strong: strongDomains, weak: weakDomains } = getStrongWeakDomains(domainPerformance);
  const { strong: strongTopics, weak: weakTopics } = getStrongWeakTopics(topicPerformance);

  const totalSolved = domainPerformance.reduce((sum, p) => sum + p.total_questions, 0);
  const avgScore = domainPerformance.length > 0
    ? domainPerformance.reduce((sum, p) => sum + (p.avg_score * p.total_questions), 0) / Math.max(totalSolved, 1)
    : 0;

  const currentLevel = getLevel(avgScore);
  const { pointsNeeded, nextLevel } = getPointsToNext(avgScore);
  const nextLevelObj = getNextLevel(avgScore);
  const progressInLevel = nextLevelObj.maxScore > nextLevelObj.minScore
    ? ((avgScore - nextLevelObj.minScore) / (nextLevelObj.maxScore - nextLevelObj.minScore)) * 100
    : 100;

  // Growth rate: ratio of strong to total practiced
  const growthRate = domainPerformance.length > 0
    ? Math.round((strongDomains.length / domainPerformance.length) * 100)
    : 0;

  // Improvement rate: % of topics above 5
  const improvingTopics = topicPerformance.filter(t => t.avg_score >= 5).length;
  const improvementRate = topicPerformance.length > 0
    ? Math.round((improvingTopics / topicPerformance.length) * 100)
    : 0;

  const radarData = domainPerformance.map((d) => ({
    subject: d.domain_name.split(" ").slice(0, 2).join(" "),
    score: d.avg_score,
    fullMark: 10,
  }));

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

      {/* Profile Header with Level */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{displayName}</h2>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-lg font-bold">{points}</span>
              <span className="text-xs text-muted-foreground">points</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-muted/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${currentLevel.color}`}>{currentLevel.name}</span>
              <span className="text-xs text-muted-foreground">· Score: {avgScore.toFixed(1)}/10</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Number(pointsNeeded) > 0 ? `${pointsNeeded} pts to ${nextLevel}` : "Max level reached!"}
            </span>
          </div>
          <Progress value={progressInLevel} className="h-2" />
          <div className="flex justify-between mt-1.5">
            {LEVELS.map((l) => (
              <span key={l.name} className={`text-[10px] ${avgScore >= l.minScore ? l.color : "text-muted-foreground/40"}`}>
                {l.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Target, label: "Overall Score", value: avgScore.toFixed(1), sub: "out of 10", color: "text-primary" },
          { icon: Code2, label: "Questions Solved", value: totalSolved.toString(), sub: "total", color: "text-foreground" },
          { icon: TrendingUp, label: "Growth Rate", value: `${growthRate}%`, sub: "strong domains", color: "text-success" },
          { icon: BarChart3, label: "Improvement", value: `${improvementRate}%`, sub: "topics above 5", color: "text-warning" },
          { icon: Zap, label: "Points", value: points.toString(), sub: "earned", color: "text-primary" },
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

      {/* Domain Level Progress Cards */}
      {domainPerformance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Domain Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {domainPerformance.map((d) => {
              const level = getLevel(d.avg_score);
              const { pointsNeeded: ptsNeeded, nextLevel: nxtLvl } = getPointsToNext(d.avg_score);
              const nxtObj = getNextLevel(d.avg_score);
              const prog = nxtObj.maxScore > nxtObj.minScore
                ? ((d.avg_score - nxtObj.minScore) / (nxtObj.maxScore - nxtObj.minScore)) * 100
                : 100;

              return (
                <div key={d.id} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{d.domain_icon}</span>
                      <div>
                        <span className="text-sm font-medium">{d.domain_name}</span>
                        <span className={`text-[10px] ml-2 font-semibold ${level.color}`}>{level.name}</span>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold">{d.avg_score.toFixed(1)}</span>
                  </div>
                  <Progress value={prog} className="h-1.5 mb-1" />
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">{d.total_questions} questions</span>
                    <span className="text-[10px] text-muted-foreground">
                      {Number(ptsNeeded) > 0 ? `${ptsNeeded} to ${nxtLvl}` : "Max!"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Strong & Weak Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-success" />
            <h3 className="text-sm font-medium">Strong Zones</h3>
          </div>
          {strongDomains.length === 0 && strongTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete more questions to identify your strengths.</p>
          ) : (
            <div className="space-y-2">
              {strongDomains.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.domain_icon}</span>
                    <span className="text-sm font-medium">{d.domain_name}</span>
                  </div>
                  <span className="text-sm font-mono text-success">{d.avg_score.toFixed(1)}</span>
                </div>
              ))}
              {strongTopics.slice(0, 3).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <span className="text-sm font-medium">{t.topic_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.domain_name}</span>
                  </div>
                  <span className="text-sm font-mono text-success">{t.avg_score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h3 className="text-sm font-medium">Needs Improvement</h3>
          </div>
          {weakDomains.length === 0 && weakTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weak areas identified yet. Keep practicing!</p>
          ) : (
            <div className="space-y-2">
              {weakDomains.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.domain_icon}</span>
                    <div>
                      <span className="text-sm font-medium">{d.domain_name}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">
                        {getPointsToNext(d.avg_score).pointsNeeded} pts to {getPointsToNext(d.avg_score).nextLevel}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-destructive">{d.avg_score.toFixed(1)}</span>
                </div>
              ))}
              {weakTopics.slice(0, 3).map((t: any) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Domain Strength Radar</h3>
          {radarData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No domain data yet</div>
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

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Topic Performance</h3>
          {topicBarData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">No topic data yet</div>
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

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium">Recommended Practice</h3>
        </div>
        {weakDomains.length === 0 && weakTopics.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">Start practicing to get personalized recommendations!</p>
            <Link to="/practice">
              <button className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
                Go to Practice <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakDomains.slice(0, 3).map((d) => (
              <Link to="/practice" key={d.id} className="p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{d.domain_icon}</span>
                  <span className="text-sm font-medium">{d.domain_name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Score: {d.avg_score.toFixed(1)} · {getPointsToNext(d.avg_score).pointsNeeded} pts to {getPointsToNext(d.avg_score).nextLevel}
                </p>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
