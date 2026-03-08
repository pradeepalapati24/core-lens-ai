import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useDomainPerformance, useTopicPerformance, getStrongWeakDomains, getStrongWeakTopics } from "@/hooks/useUserPerformance";
import { useDomains } from "@/hooks/useDomains";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Download, Share2, Copy, Check, Loader2, Trophy, Target, Code2, TrendingUp, Star, Zap, Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";

const LEVELS = [
  { name: "Beginner", minScore: 0, maxScore: 40, color: "text-muted-foreground" },
  { name: "Intermediate", minScore: 40, maxScore: 70, color: "text-warning" },
  { name: "Advanced", minScore: 70, maxScore: 90, color: "text-primary" },
  { name: "Expert", minScore: 90, maxScore: 100, color: "text-success" },
];

function getLevel(score: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) return LEVELS[i];
  }
  return LEVELS[0];
}

export default function SkillReportPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: domains = [] } = useDomains();
  const { data: domainPerformance = [] } = useDomainPerformance(userId);
  const { data: topicPerformance = [] } = useTopicPerformance(userId);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email || "");
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setDisplayName(profile?.display_name || profile?.username || "User");
        setPoints(profile?.points || 0);
      }
      setLoading(false);
    };
    init();
  }, []);

  const { strong: strongDomains } = getStrongWeakDomains(domainPerformance);
  const { strong: strongTopics } = getStrongWeakTopics(topicPerformance);
  
  const totalSolved = domainPerformance.reduce((s, p) => s + p.total_questions, 0);
  const avgScore = domainPerformance.length > 0
    ? (domainPerformance.reduce((s, p) => s + (p.avg_score * p.total_questions), 0) / Math.max(totalSolved, 1)) * 10
    : 0;
  const currentLevel = getLevel(avgScore);

  const radarData = domainPerformance.map((d) => ({
    subject: d.domain_name.split(" ").slice(0, 2).join(" "),
    score: d.avg_score * 10,
    fullMark: 100,
  }));

  const shareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share your skill report." });
    setTimeout(() => setCopied(false), 2000);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-[28px] font-semibold">Skill Report</h1>
          <p className="text-sm text-muted-foreground">Shareable proficiency summary</p>
        </motion.div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={shareLink}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
          <Button variant="outline" size="sm" onClick={printReport}>
            <Download className="w-4 h-4 mr-1" /> Print/PDF
          </Button>
        </div>
      </div>

      {/* Report Card */}
      <div ref={reportRef} className="space-y-6 print:space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">CoreLens</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
          <p className="text-sm text-muted-foreground mb-4">{userEmail}</p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Award className={`w-5 h-5 ${currentLevel.color}`} />
            <span className={`font-semibold ${currentLevel.color}`}>{currentLevel.name}</span>
            <span className="text-sm text-muted-foreground">· {Math.round(avgScore)}/100</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Target, label: "Overall Score", value: `${Math.round(avgScore)}/100`, color: "text-primary" },
            { icon: Code2, label: "Questions Solved", value: totalSolved.toString(), color: "text-foreground" },
            { icon: Star, label: "Points Earned", value: points.toString(), color: "text-warning" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="surface-elevated p-5 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6">
            <h3 className="text-sm font-medium mb-4 text-center">Domain Proficiency</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Domain Breakdown */}
        {domainPerformance.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-6">
            <h3 className="text-sm font-medium mb-4">Domain Breakdown</h3>
            <div className="space-y-3">
              {domainPerformance.map((d) => {
                const score100 = d.avg_score * 10;
                const level = getLevel(score100);
                return (
                  <div key={d.id} className="flex items-center gap-4">
                    <span className="text-lg w-8 text-center">{d.domain_icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{d.domain_name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium ${level.color}`}>{level.name}</span>
                          <span className="text-sm font-mono font-bold">{Math.round(score100)}</span>
                        </div>
                      </div>
                      <Progress value={score100} className="h-1.5" />
                      <span className="text-[10px] text-muted-foreground">{d.total_questions} questions solved</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Top Skills */}
        {strongTopics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
            <h3 className="text-sm font-medium mb-4">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {strongTopics.slice(0, 8).map((t: any) => (
                <span key={t.id} className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {t.topic_name} · {Math.round(t.avg_score * 10)}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-muted-foreground py-4 print:py-2">
          Generated by CoreLens · {new Date().toLocaleDateString()} · corelens.lovable.app
        </div>
      </div>
    </div>
  );
}
