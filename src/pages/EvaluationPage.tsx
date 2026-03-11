import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, BookOpen, Percent, Target,
  Loader2, Clipboard, ShieldAlert, MessageCircle, Send, Brain, Sparkles, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
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
        // Save interview session with project_id if applicable
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

        // Update streak
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-streak`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({}),
              }
            );
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

  // Auto-generate follow-up questions after evaluation
  useEffect(() => {
    if (aiEvaluation && followUpQuestions.length === 0 && conversationRound === 0) {
      generateFollowUpQuestions();
    }
  }, [aiEvaluation]);

  const generateFollowUpQuestions = async () => {
    setLoadingFollowUp(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-followup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
        }
      );
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-followup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            question: question.question,
            answer,
            originalProblem: state?.question?.questionText || "",
            domain: state?.domain || "",
            topic: state?.topic || "",
            reasoningType: question.reasoningType,
          }),
        }
      );
      if (response.ok) {
        const evalData = await response.json();
        setFollowUpEvaluations(prev => ({ ...prev, [index]: evalData }));
        setConversationHistory(prev => [...prev, { question: question.question, answer, evaluation: evalData }]);

        // Check if all answered — show continue option
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
  const scoreColor = displayScore >= 70 ? "text-success" : displayScore >= 50 ? "text-warning" : "text-destructive";
  const hiringProb = aiEvaluation?.hiringProbability ?? Math.round(finalScore * 10);

  const reasoningTypeLabels: Record<string, string> = {
    "real-world": "🌍 Real-World",
    "edge-case": "⚠️ Edge Case",
    "optimization": "⚡ Optimization",
    "trade-off": "⚖️ Trade-Off",
    "system-design": "🏗️ System Design",
    "design-implications": "🔗 Design",
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
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

      {/* Copy-Paste Detection Banner */}
      {hasPasteFlag && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <Clipboard className="w-4.5 h-4.5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-destructive">Copy-Paste Detected</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive">{copyPasteConfidence}% confidence</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{copyPasteReason || "Your explanation appears to be copy-pasted. Scores have been penalized."}</p>
            {pasteMetrics && (
              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground/70 font-mono">
                <span>Pastes: {pasteMetrics.pasteCount}</span>
                <span>Pasted: {pasteMetrics.pastedChars} chars</span>
                <span>Typed: {pasteMetrics.typedChars} chars</span>
                <span>Ratio: {(pasteMetrics.pasteRatio * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
          <ShieldAlert className="w-5 h-5 text-destructive/60 shrink-0" />
        </motion.div>
      )}

      {hasMultiplePastes && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <span className="text-2xl">⛔</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-destructive">Negative Points Applied: -{negativePenalty} pts</h4>
            <p className="text-xs text-muted-foreground mt-0.5">You pasted {pasteMetrics?.pasteCount}x. Write your own explanations to earn full points.</p>
          </div>
        </motion.div>
      )}

      {/* Score Cards — 4 cards including Reasoning Depth */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-6 text-center">
          <div className="text-xs text-muted-foreground mb-2">Final Score</div>
          <div className={`text-4xl font-bold ${scoreColor}`}>{Math.round(displayScore)}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 100</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="surface-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2"><Percent className="w-3.5 h-3.5" /> Hiring Probability</div>
          <div className={`text-4xl font-bold ${scoreColor}`}>{hiringProb}%</div>
          <div className="text-xs text-muted-foreground mt-1">based on rubric</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2"><Target className="w-3.5 h-3.5" /> Interview Readiness</div>
          <div className={`text-4xl font-bold ${scoreColor}`}>{Math.round((aiEvaluation?.interviewReadinessScore ?? finalScore) * 10)}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 100</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2"><Brain className="w-3.5 h-3.5" /> Reasoning Depth</div>
          <div className={`text-4xl font-bold ${reasoningDepthScore !== null && reasoningDepthScore * 10 >= 70 ? "text-success" : reasoningDepthScore !== null && reasoningDepthScore * 10 >= 50 ? "text-warning" : "text-destructive"}`}>
            {reasoningDepthScore !== null ? Math.round(reasoningDepthScore * 10) : "—"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">out of 100</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Rubric Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="surface-elevated p-6">
          <h3 className="text-sm font-medium mb-4">Score Dip Analysis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="score" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lost" stackId="a" fill="hsl(var(--destructive) / 0.15)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* AI Learning Insights */}
      {aiLearningInsights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-sm font-medium"><Sparkles className="w-4 h-4 text-primary" /> AI Learning Insights</h3>
          <div className="space-y-2">
            {aiLearningInsights.map((insight: string, i: number) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-primary text-xs mt-0.5">💡</span>
                <p className="text-xs text-foreground leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Overall Feedback */}
      {aiEvaluation?.overallFeedback && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="surface-elevated p-5">
          <h3 className="text-sm font-medium mb-3">Overall Feedback</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiEvaluation.overallFeedback}</p>
        </motion.div>
      )}

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5 text-success" /> Strengths</h3>
          <ul className="space-y-1.5">
            {(evaluation.strengths || []).map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-success mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><AlertTriangle className="w-3.5 h-3.5 text-warning" /> Weaknesses</h3>
          <ul className="space-y-1.5">
            {(evaluation.weaknesses || []).map((w: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-warning mt-0.5">•</span>{w}</li>)}
          </ul>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-xs font-medium"><Lightbulb className="w-3.5 h-3.5 text-primary" /> Improvements</h3>
          <ul className="space-y-1.5">
            {(evaluation.suggestions || []).map((s: string, i: number) => <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{s}</li>)}
          </ul>
        </motion.div>
      </div>

      {/* Technical Explanation of the Question */}
      {evaluation.expertExplanation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="surface-elevated p-6 border-l-4 border-primary">
          <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            Technical Explanation
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4">Here's the expert-level explanation for this question — the approach, reasoning, and key concepts you should know.</p>
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

      {/* AI Interview Follow-Up Questions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="surface-elevated p-6">
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
            {followUpQuestions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/8 px-2 py-0.5 rounded">
                    {reasoningTypeLabels[q.reasoningType] || q.reasoningType}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{q.intent}</span>
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
                            {key}: {(val as number * 10).toString()}
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
            ))}

            {/* Continue conversation button */}
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

      {/* Recommended Next Practice */}
      {recommendedFocusArea && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="surface-elevated p-5">
          <h3 className="flex items-center gap-1.5 mb-3 text-sm font-medium"><Target className="w-4 h-4 text-warning" /> Recommended Next Practice</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Your weakest area is <span className="font-semibold text-warning">{rubricLabels[recommendedFocusArea] || recommendedFocusArea}</span>. We recommend focusing on questions that emphasize this skill.
          </p>
          <Link to="/practice">
            <Button size="sm" className="gap-2 text-xs">
              Practice {rubricLabels[recommendedFocusArea] || recommendedFocusArea} <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </motion.div>
      )}

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
