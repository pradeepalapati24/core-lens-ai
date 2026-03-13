import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, BookOpen, Percent, Target,
  Loader2, Clipboard, ShieldAlert, MessageCircle, Send, Brain, Sparkles, RefreshCw, Info, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import RubricRadar3D from "@/components/3d/RubricRadar3D";
import RubricBars3D from "@/components/3d/RubricBars3D";
import { supabase } from "@/integrations/supabase/client";

const rubricLabels: Record<string, string> = {
  understanding: "Understanding",
  algorithmicThinking: "Algorithmic",
  codeQuality: "Code Quality",
  edgeCases: "Edge Cases",
  communication: "Communication",
  domainKnowledge: "Domain",
  problemUnderstanding: "Understanding",
  edgeCaseAwareness: "Edge Cases",
  communicationClarity: "Communication",
};

const metricTooltips: Record<string, string> = {
  finalScore: "Your overall weighted score based on six rubric categories: Understanding (20%), Algorithmic Thinking (20%), Code Quality (15%), Edge Cases (15%), Communication (15%), and Domain Knowledge (15%).",
  hiringProbability: "Estimates the likelihood of passing a real technical interview based on your rubric scores and explanation quality.",
  interviewReadiness: "Measures whether your explanation demonstrates the depth and clarity expected in a real technical interview. A score above 70 indicates you're approaching interview-ready.",
  reasoningDepth: "Measures how well you explain the underlying logic, equations, and relationships between concepts — not just what the answer is, but why it works.",
};

interface FollowUpQuestion {
  question: string;
  reasoningType: string;
  intent: string;
}

interface ConversationEntry {
  question: string;
  answer: string;
  evaluation?: any;
}

const reasoningTypeLabels: Record<string, { label: string; tag: string; color: string }> = {
  "real-world": { label: "🌍 Real-World", tag: "Concept Application", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  "edge-case": { label: "⚠️ Edge Case", tag: "Advanced Reasoning", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  "optimization": { label: "⚡ Optimization", tag: "Performance Analysis", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "trade-off": { label: "⚖️ Trade-Off", tag: "System Design", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  "system-design": { label: "🏗️ System Design", tag: "Architecture", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  "design-implications": { label: "🔗 Design", tag: "Design Thinking", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
};

function ScoreCard({ label, value, subtitle, delay, icon: Icon, tooltipText }: {
  label: string; value: string | number; subtitle: string; delay: number;
  icon?: any; tooltipText?: string;
}) {
  const numVal = typeof value === "string" ? parseInt(value) : value;
  const scoreColor = numVal >= 70 ? "text-success" : numVal >= 50 ? "text-warning" : "text-destructive";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="surface-elevated p-6 text-center relative">
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {tooltipText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-muted-foreground/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={`text-4xl font-bold ${scoreColor}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </motion.div>
  );
}

export default function EvaluationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Follow-up state
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<number, string>>({});
  const [followUpEvaluations, setFollowUpEvaluations] = useState<Record<number, any>>({});
  const [evaluatingFollowUp, setEvaluatingFollowUp] = useState<number | null>(null);
  const [conversationRound, setConversationRound] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [showConversationContinue, setShowConversationContinue] = useState(false);

  const aiEvaluation = state?.evaluation;

  const evaluation = aiEvaluation ? {
    finalScore: aiEvaluation.finalScore || 0,
    rubric: aiEvaluation.scores || {},
    strengths: aiEvaluation.strengths || [],
    weaknesses: aiEvaluation.weaknesses || [],
    suggestions: aiEvaluation.improvements || [],
    nextSteps: aiEvaluation.improvements?.slice(0, 4) || [],
    expertExplanation: aiEvaluation.expertExplanation || aiEvaluation.overallFeedback || "",
    hiringProbability: aiEvaluation.hiringProbability || 0,
    interviewReadiness: aiEvaluation.interviewReadinessScore || 0,
  } : null;

  const copyPasteDetected = aiEvaluation?.copyPasteDetected === true;
  const copyPasteConfidence = aiEvaluation?.copyPasteConfidence || 0;
  const copyPasteReason = aiEvaluation?.copyPasteReason || "";
  const pasteMetrics = state?.pasteMetrics;
  const hasPasteFlag = copyPasteDetected || (pasteMetrics?.pasteRatio > 0.7);
  const hasMultiplePastes = (pasteMetrics?.pasteCount || 0) >= 2;
  const negativePenalty = hasMultiplePastes ? Math.min((pasteMetrics?.pasteCount || 0) * 15, 50) : 0;
  const reasoningDepthScore = aiEvaluation?.reasoningDepthScore ?? null;
  const aiLearningInsights = aiEvaluation?.aiLearningInsights || [];
  const recommendedFocusArea = aiEvaluation?.recommendedFocusArea || "";

  const rubric = aiEvaluation?.scores || {};
  const finalScore = aiEvaluation?.finalScore ?? 0;

  // Save evaluation results
  useEffect(() => {
    const saveResults = async () => {
      if (saved || saving || !aiEvaluation) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setSaving(true);
      try {
        const domainId = state?.question?.domainId || state?.domainId;
        const topicId = state?.question?.topicId || state?.topicId;
        const subtopicId = state?.question?.subtopicId || state?.subtopicId;
        let resolvedDomainId = domainId;
        let resolvedTopicId = topicId;
        if (!resolvedDomainId && state?.domain) {
          const { data: domainData } = await supabase.from("domains").select("id").eq("name", state.domain).single();
          resolvedDomainId = domainData?.id;
        }
        if (!resolvedTopicId && state?.topic && resolvedDomainId) {
          const { data: topicData } = await supabase.from("topics").select("id").eq("name", state.topic).eq("domain_id", resolvedDomainId).single();
          resolvedTopicId = topicData?.id;
        }
        const basePoints = Math.round(finalScore * 10);
        const pointsEarned = hasMultiplePastes ? Math.max(basePoints - negativePenalty, -20) : basePoints;
        const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single();
        if (profile) {
          const newPoints = Math.max((profile.points || 0) + pointsEarned, 0);
          await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id);
        }
        if (resolvedDomainId) {
          const { data: existingDomainPerf } = await supabase.from("user_performance").select("*").eq("user_id", user.id).eq("domain_id", resolvedDomainId).is("topic_id", null).is("subtopic_id", null).single();
          if (existingDomainPerf) {
            const newTotal = existingDomainPerf.total_questions + 1;
            const newAvg = ((existingDomainPerf.avg_score * existingDomainPerf.total_questions) + finalScore) / newTotal;
            await supabase.from("user_performance").update({ total_questions: newTotal, avg_score: newAvg, last_practiced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", existingDomainPerf.id);
          } else {
            await supabase.from("user_performance").insert({ user_id: user.id, domain_id: resolvedDomainId, total_questions: 1, avg_score: finalScore, last_practiced_at: new Date().toISOString() });
          }
        }
        if (resolvedDomainId && resolvedTopicId) {
          const { data: existingTopicPerf } = await supabase.from("user_performance").select("*").eq("user_id", user.id).eq("domain_id", resolvedDomainId).eq("topic_id", resolvedTopicId).is("subtopic_id", null).single();
          if (existingTopicPerf) {
            const newTotal = existingTopicPerf.total_questions + 1;
            const newAvg = ((existingTopicPerf.avg_score * existingTopicPerf.total_questions) + finalScore) / newTotal;
            await supabase.from("user_performance").update({ total_questions: newTotal, avg_score: newAvg, last_practiced_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", existingTopicPerf.id);
          } else {
            await supabase.from("user_performance").insert({ user_id: user.id, domain_id: resolvedDomainId, topic_id: resolvedTopicId, total_questions: 1, avg_score: finalScore, last_practiced_at: new Date().toISOString() });
          }
        }
        const projectId = state?.projectId || null;
        if (state?.question?.id) {
          await supabase.from("interview_sessions").insert({
            user_id: user.id,
            question_id: state.question.id,
            initial_code: state?.code || null,
            initial_explanation: state?.explanation || null,
            initial_evaluation: aiEvaluation,
            session_status: "completed",
            completed_at: new Date().toISOString(),
            reasoning_depth_score: reasoningDepthScore,
            weakest_rubric: recommendedFocusArea || null,
            project_id: projectId,
          });
        }
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-streak`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({}),
            });
          }
        } catch (streakErr) {
          console.error("Streak update failed:", streakErr);
        }
        setSaved(true);
      } catch (error) {
        console.error("Error saving evaluation results:", error);
      } finally {
        setSaving(false);
      }
    };
    saveResults();
  }, [aiEvaluation, state, finalScore, saved, saving, hasMultiplePastes, negativePenalty]);

  useEffect(() => {
    if (aiEvaluation && followUpQuestions.length === 0 && conversationRound === 0) {
      generateFollowUpQuestions();
    }
  }, [aiEvaluation]);

  const generateFollowUpQuestions = async () => {
    setLoadingFollowUp(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          problem: state?.question?.questionText || "",
          explanation: state?.explanation || "",
          code: state?.code || null,
          evaluation: aiEvaluation,
          domain: state?.domain || "",
          topic: state?.topic || "",
          conversationHistory,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setFollowUpQuestions(data.questions || []);
        setConversationRound(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to generate follow-up questions:", err);
    } finally {
      setLoadingFollowUp(false);
    }
  };

  const submitFollowUpAnswer = async (index: number) => {
    const answer = followUpAnswers[index];
    if (!answer?.trim()) return;
    const question = followUpQuestions[index];
    setEvaluatingFollowUp(index);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-followup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          question: question.question,
          answer,
          originalProblem: state?.question?.questionText || "",
          domain: state?.domain || "",
          topic: state?.topic || "",
          reasoningType: question.reasoningType,
        }),
      });
      if (response.ok) {
        const evalData = await response.json();
        setFollowUpEvaluations(prev => ({ ...prev, [index]: evalData }));
        setConversationHistory(prev => [...prev, { question: question.question, answer, evaluation: evalData }]);
        const answeredCount = Object.keys(followUpEvaluations).length + 1;
        if (answeredCount >= followUpQuestions.length && conversationRound < 3) {
          setShowConversationContinue(true);
        }
      }
    } catch (err) {
      console.error("Follow-up evaluation error:", err);
    } finally {
      setEvaluatingFollowUp(null);
    }
  };

  const continueConversation = () => {
    setFollowUpQuestions([]);
    setFollowUpAnswers({});
    setFollowUpEvaluations({});
    setShowConversationContinue(false);
    generateFollowUpQuestions();
  };

  if (!aiEvaluation || !evaluation) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20">
        <h1 className="text-xl font-semibold mb-2">No Evaluation Data</h1>
        <p className="text-sm text-muted-foreground mb-6">Complete a practice question to see your evaluation results.</p>
        <Link to="/practice"><Button>Start Practicing</Button></Link>
      </div>
    );
  }

  const displayScore = finalScore * 10;
  const radarData = Object.entries(rubric).map(([key, val]) => ({ subject: rubricLabels[key] || key, score: (val as number) * 10, fullMark: 100 }));
  const barData = Object.entries(rubric).map(([key, val]) => ({ name: rubricLabels[key] || key, score: (val as number) * 10, lost: 100 - ((val as number) * 10) }));
  const hiringProb = aiEvaluation?.hiringProbability ?? Math.round(finalScore * 10);

  // Ensure strengths is never empty
  const displayStrengths = evaluation.strengths.length > 0
    ? evaluation.strengths
    : ["You attempted the question and submitted a response."];

  // Structured feedback: split overallFeedback into "What Went Wrong" and "What Interviewers Expect"
  const overallFeedback = aiEvaluation?.overallFeedback || "";
  const whatWentWrong = evaluation.weaknesses;
  const whatInterviewersExpect = aiEvaluation?.whatInterviewersExpect || [];

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <Link to="/dashboard" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <h1 className="text-[28px] font-semibold mb-1">Evaluation Results</h1>
          {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {saved && <span className="text-xs text-success">✓ Saved</span>}
        </div>
        <p className="text-sm text-muted-foreground">{state?.domain} — {state?.topic}</p>
      </motion.div>

      {/* ───── 1. SCORE SUMMARY ───── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ScoreCard label="Final Score" value={Math.round(displayScore)} subtitle="out of 100" delay={0} tooltipText={metricTooltips.finalScore} />
        <ScoreCard label="Hiring Probability" value={`${hiringProb}%`} subtitle="based on rubric" delay={0.05} icon={Percent} tooltipText={metricTooltips.hiringProbability} />
        <ScoreCard label="Interview Readiness" value={Math.round((aiEvaluation?.interviewReadinessScore ?? finalScore) * 10)} subtitle="out of 100" delay={0.1} icon={Target} tooltipText={metricTooltips.interviewReadiness} />
        <ScoreCard label="Reasoning Depth" value={reasoningDepthScore !== null ? Math.round(reasoningDepthScore * 10) : "—"} subtitle="out of 100" delay={0.15} icon={Brain} tooltipText={metricTooltips.reasoningDepth} />
      </div>

      {/* ───── 2. COPY-PASTE DETECTION (learning-style) ───── */}
      {hasPasteFlag && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
          <div className="flex items-start gap-3 p-5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clipboard className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold text-amber-400">Your response appears to be copied</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{copyPasteConfidence}% confidence</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p>In technical interviews, interviewers evaluate how clearly you can explain concepts <span className="text-foreground font-medium">in your own words</span>. Copy-pasting the question or external text does not demonstrate understanding.</p>
                <p className="text-foreground/80">💡 <span className="font-medium">Try this instead:</span> Explain the concept step-by-step — start with a definition, then walk through the logic, and finish with a real-world example.</p>
              </div>
              {pasteMetrics && (
                <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground/60 font-mono border-t border-amber-500/10 pt-2">
                  <span>Pastes: {pasteMetrics.pasteCount}</span>
                  <span>Pasted: {pasteMetrics.pastedChars} chars</span>
                  <span>Typed: {pasteMetrics.typedChars} chars</span>
                  <span>Ratio: {(pasteMetrics.pasteRatio * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>
          {hasMultiplePastes && (
            <div className="flex items-center gap-3 px-5 py-3 bg-destructive/5 border-t border-destructive/20">
              <span className="text-sm">⚠️</span>
              <div className="flex-1">
                <span className="text-xs font-semibold text-destructive">Points adjustment: -{negativePenalty} pts</span>
                <span className="text-xs text-muted-foreground ml-2">({pasteMetrics?.pasteCount} paste events detected)</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ───── 3. WHAT WENT WRONG ───── */}
      {whatWentWrong.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-2 mb-3 text-sm font-semibold text-foreground">
            <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            </div>
            What Went Wrong
          </h3>
          <ul className="space-y-1.5">
            {whatWentWrong.map((w: string, i: number) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>{w}
              </li>
            ))}
          </ul>
          {whatInterviewersExpect.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                What Interviewers Expect
              </h4>
              <ul className="space-y-1.5">
                {whatInterviewersExpect.map((item: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">→</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* ───── 4. AI LEARNING INSIGHTS ───── */}
      {aiLearningInsights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-primary" /> AI Learning Insights
          </h3>
          <div className="space-y-2">
            {aiLearningInsights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-primary text-xs mt-0.5">💡</span>
                <p className="text-xs text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
          {recommendedFocusArea && (
            <div className="mt-3 p-3 rounded-lg bg-warning/5 border border-warning/15">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-warning">Recommended focus:</span>{" "}
                {rubricLabels[recommendedFocusArea] || recommendedFocusArea} — this is the area where practice will have the biggest impact on your scores.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* ───── 5. 3D CHARTS ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Rubric Radar</h3>
          <RubricRadar3D data={radarData} color="hsl(var(--primary))" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Score Dip Analysis</h3>
          <RubricBars3D data={barData} color="hsl(var(--primary))" />
        </motion.div>
      </div>

      {/* ───── 6. EXPERT EXPLANATION ───── */}
      {evaluation.expertExplanation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="surface-elevated p-6 border-l-4 border-primary">
          <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            Expert Explanation
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">
            This is what a strong, interview-level response would look like — use it to understand the expected depth and structure.
          </p>
          <div className="prose prose-sm max-w-none space-y-1">
            {evaluation.expertExplanation.split("\n").map((line: string, i: number) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold mt-4 mb-1.5 text-foreground">{line.replace("## ", "")}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-semibold mt-3 mb-1 text-foreground">{line.replace("### ", "")}</h3>;
              if (line.startsWith("```")) return null;
              if (line.startsWith("- ")) return <li key={i} className="text-xs text-muted-foreground ml-4 mb-0.5">{line.replace("- ", "")}</li>;
              if (line.startsWith("**")) return <p key={i} className="text-xs font-semibold text-foreground mb-1">{line.replace(/\*\*/g, "")}</p>;
              if (!line.trim()) return <br key={i} />;
              return <p key={i} className="text-xs text-muted-foreground leading-relaxed mb-1">{line}</p>;
            })}
          </div>
        </motion.div>
      )}

      {/* ───── 7. STRENGTHS / WEAKNESSES / IMPROVEMENTS ───── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5 text-success" /> Strengths</h3>
          <ul className="space-y-1.5">
            {displayStrengths.map((s: string, i: number) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-success mt-0.5">•</span>{s}</li>
            ))}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><AlertTriangle className="w-3.5 h-3.5 text-warning" /> Weaknesses</h3>
          <ul className="space-y-1.5">
            {(evaluation.weaknesses || []).map((w: string, i: number) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-warning mt-0.5">•</span>{w}</li>
            ))}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Improvements</h3>
          <ul className="space-y-1.5">
            {(evaluation.suggestions || []).map((s: string, i: number) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ───── 8. FOLLOW-UP INTERVIEW QUESTIONS ───── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="surface-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">AI Interview Follow-Up Questions</h3>
              <p className="text-[11px] text-muted-foreground">
                Round {conversationRound}/3 — Answer to deepen your interview practice
              </p>
            </div>
          </div>
        </div>

        {loadingFollowUp ? (
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Generating follow-up questions...</span>
          </div>
        ) : followUpQuestions.length > 0 ? (
          <div className="space-y-4">
            {followUpQuestions.map((q, i) => {
              const typeInfo = reasoningTypeLabels[q.reasoningType] || { label: q.reasoningType, tag: "General", color: "bg-muted text-muted-foreground border-border" };
              return (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-normal h-5">{typeInfo.tag}</Badge>
                    {q.intent && <span className="text-[10px] text-muted-foreground italic">{q.intent}</span>}
                  </div>
                  <p className="text-sm font-medium mb-3">{q.question}</p>

                  {followUpEvaluations[i] ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="text-xs text-muted-foreground mb-1 font-medium">Your answer:</p>
                        <p className="text-xs text-foreground">{followUpAnswers[i]}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-xs font-medium text-primary mb-2">AI Feedback</p>
                        <p className="text-xs text-muted-foreground mb-2">{followUpEvaluations[i].feedback}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(followUpEvaluations[i].scores || {}).map(([key, val]) => (
                            <span key={key} className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              (val as number) >= 7 ? "bg-success/10 text-success" : (val as number) >= 5 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                            }`}>
                              {key}: {String((val as number) * 10)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <textarea
                        value={followUpAnswers[i] || ""}
                        onChange={(e) => setFollowUpAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        placeholder="Type your answer..."
                        className="flex-1 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[80px]"
                      />
                      <Button
                        size="sm"
                        onClick={() => submitFollowUpAnswer(i)}
                        disabled={!followUpAnswers[i]?.trim() || evaluatingFollowUp === i}
                        className="h-10 self-end"
                      >
                        {evaluatingFollowUp === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {showConversationContinue && conversationRound < 3 && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-2">
                <Button variant="outline" onClick={continueConversation} className="gap-2 text-sm">
                  <RefreshCw className="w-3.5 h-3.5" /> Continue Interview (Round {conversationRound + 1}/3)
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2">The AI will ask deeper follow-up questions based on your answers</p>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No follow-up questions available
          </div>
        )}
      </motion.div>

      {/* ───── PRACTICE ANOTHER ───── */}
      <div className="text-center pb-4">
        <Link to="/domains">
          <Button size="lg" className="h-9 px-6 text-sm font-medium">
            Practice Another Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
