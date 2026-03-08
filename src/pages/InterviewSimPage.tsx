import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Lightbulb, ChevronDown, ChevronUp, BookOpen, Play, Loader2, RefreshCw, ArrowRight, ArrowLeft, Code2, FileText, Clock, AlertTriangle, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const TIMER_DURATIONS: Record<string, number> = {
  beginner: 15 * 60,
  intermediate: 25 * 60,
  advanced: 40 * 60,
};

export default function InterviewSimPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const meta = location.state as any;

  const includeCode = meta?.includeCode !== false;
  const totalTime = TIMER_DURATIONS[meta?.difficulty || "intermediate"] || 25 * 60;

  const [question, setQuestion] = useState<any>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [code, setCode] = useState(`// Write your solution here\n\nfunction solution() {\n  \n}\n`);
  const [explanation, setExplanation] = useState("");
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [language, setLanguage] = useState("javascript");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Copy-paste detection
  const [pasteCount, setPasteCount] = useState(0);
  const [pastedChars, setPastedChars] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [pasteWarningLevel, setPasteWarningLevel] = useState<"none" | "warning" | "penalty">("none");

  const handleExplanationPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    const newPasteCount = pasteCount + 1;
    setPasteCount(newPasteCount);
    setPastedChars(prev => prev + pastedText.length);
    if (newPasteCount === 1 && pastedText.length > 50) {
      setPasteWarningLevel("warning");
      setShowPasteWarning(true);
      setTimeout(() => setShowPasteWarning(false), 5000);
    } else if (newPasteCount >= 2) {
      setPasteWarningLevel("penalty");
      setShowPasteWarning(true);
      setTimeout(() => setShowPasteWarning(false), 6000);
    }
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    if (newVal.length > explanation.length && newVal.length - explanation.length <= 2) {
      setTypedChars(prev => prev + (newVal.length - explanation.length));
    }
    setExplanation(newVal);
  };


  useEffect(() => {
    if (meta) generateQuestion();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            toast({ variant: "destructive", title: "Time's up!", description: "Your interview time has ended. Submitting your answer..." });
            handleSubmit();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current!);
    }
  }, [isRunning]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const timeProgress = ((totalTime - timeLeft) / totalTime) * 100;
  const isLowTime = timeLeft < 120;

  const generateQuestion = async () => {
    setIsLoadingQuestion(true);
    setRevealedHints(0);
    setCurrentStep(1);
    setTimeLeft(totalTime);
    setIsRunning(false);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            domain: meta?.domain,
            topic: meta?.topic,
            subtopic: meta?.subtopic,
            difficulty: meta?.difficulty || "intermediate",
            domainId: meta?.domainId,
            topicId: meta?.topicId,
            subtopicId: meta?.subtopicId,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to generate question");
      const questionData = await response.json();
      setQuestion(questionData);
      setIsRunning(true);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to generate question." });
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported."); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setExplanation(transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleSubmit = async () => {
    if (!question) return;
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    const steps = ["Analyzing reasoning...", "Evaluating code quality...", "Checking edge cases...", "Generating feedback..."];
    let idx = 0;
    setEvaluationStep(steps[0]);
    const si = setInterval(() => { idx++; if (idx < steps.length) setEvaluationStep(steps[idx]); }, 1500);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ problem: question.questionText, code: includeCode ? code : null, explanation, domain: question.domain, topic: question.topic }),
      });
      clearInterval(si);
      if (!response.ok) { toast({ variant: "destructive", title: "Evaluation Failed", description: "Something went wrong." }); setIsSubmitting(false); return; }
      const evaluation = await response.json();
      navigate("/evaluation", {
        state: {
          code: includeCode ? code : null, explanation, question, includeCode, evaluation,
          domain: question.domain, topic: question.topic,
          interviewMode: true, timeUsed: totalTime - timeLeft, totalTime,
        },
      });
    } catch {
      clearInterval(si);
      toast({ variant: "destructive", title: "Connection Error", description: "Failed to connect." });
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = includeCode ? code.trim().length > 20 : true;
  const canSubmit = question && explanation.trim().length > 10;

  if (!meta) {
    return (
      <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No interview session configured.</p>
          <Button onClick={() => navigate("/practice")}>Go to Practice</Button>
        </div>
      </div>
    );
  }

  if (isLoadingQuestion) {
    return (
      <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Setting Up Interview</h3>
          <p className="text-sm text-muted-foreground">Preparing a {meta?.difficulty} challenge...</p>
        </motion.div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
        <Button onClick={generateQuestion}><RefreshCw className="w-4 h-4 mr-2" /> Try Again</Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Timer bar */}
      <div className="h-12 border-b border-border flex items-center px-4 gap-4 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isLowTime ? "text-destructive animate-pulse" : "text-primary"}`} />
          <span className={`font-mono text-lg font-bold ${isLowTime ? "text-destructive" : "text-foreground"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <Progress value={timeProgress} className="flex-1 h-2 max-w-xs" />
        <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Interview Mode</span>
        {isLowTime && <AlertTriangle className="w-4 h-4 text-destructive animate-bounce" />}
        <div className="ml-auto flex items-center gap-2">
          {includeCode && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentStep(1)} className={`px-2 py-0.5 rounded text-[10px] font-medium ${currentStep === 1 ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                <Code2 className="w-3 h-3 inline mr-1" />Code
              </button>
              <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
              <button onClick={() => canProceedToStep2 && setCurrentStep(2)} className={`px-2 py-0.5 rounded text-[10px] font-medium ${currentStep === 2 ? "bg-primary/15 text-primary" : "text-muted-foreground"} ${!canProceedToStep2 ? "opacity-40" : ""}`}>
                <FileText className="w-3 h-3 inline mr-1" />Explain
              </button>
            </div>
          )}
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            meta?.difficulty === "beginner" ? "bg-success/10 text-success" :
            meta?.difficulty === "intermediate" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
          }`}>{(meta?.difficulty || "").toUpperCase()}</span>
        </div>
      </div>

      {isSubmitting && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-8 text-center max-w-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Evaluating</h3>
            <p className="text-sm text-muted-foreground">{evaluationStep}</p>
          </motion.div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Question Panel */}
        <div className={`${includeCode ? "lg:col-span-3" : "lg:col-span-4"} border-r border-border overflow-y-auto p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">{question.domain} / {question.topic} / {question.subtopic}</span>
          </div>
          <h2 className="font-medium text-sm mb-3">Problem</h2>
          <div className="prose prose-sm max-w-none">
            {question.questionText.split("\n").map((line: string, i: number) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground">{line.replace("## ", "")}</h2>;
              if (line.startsWith("- ")) return <li key={i} className="text-xs text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
              return <p key={i} className="text-xs text-muted-foreground mb-1">{line}</p>;
            })}
          </div>

          <div className="mt-5">
            <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-xs font-medium text-warning">
              <Lightbulb className="w-3.5 h-3.5" /> Hints ({revealedHints}/{question.hints?.length || 0})
              {showHints ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            {showHints && (
              <div className="mt-2 space-y-2">
                {question.hints?.slice(0, revealedHints).map((h: string, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-warning/5 border border-border text-xs">{h}</div>
                ))}
                {revealedHints < (question.hints?.length || 0) && (
                  <button onClick={() => setRevealedHints(revealedHints + 1)} className="text-xs text-warning hover:underline">Reveal next hint</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        {includeCode && currentStep === 1 ? (
          <div className="lg:col-span-9 flex flex-col min-h-0">
            <div className="h-9 border-b border-border flex items-center px-4 gap-3">
              <span className="text-xs text-muted-foreground font-mono">solution.js</span>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="ml-auto text-xs bg-muted/40 border border-border rounded px-2 py-1">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <div className="flex-1 min-h-0">
              <Editor height="100%" defaultLanguage={language} theme="vs-dark" value={code} onChange={(v) => setCode(v || "")}
                options={{ minimap: { enabled: false }, fontSize: 13, fontFamily: "JetBrains Mono", padding: { top: 12 }, scrollBeyondLastLine: false }} />
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Write your solution, then explain</p>
              <Button onClick={() => setCurrentStep(2)} disabled={!canProceedToStep2} className="h-9 px-6 text-sm">
                Next: Explain <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className={`${includeCode ? "lg:col-span-9" : "lg:col-span-8"} flex flex-col min-h-0`}>
            {includeCode && (
              <div className="h-9 border-b border-border flex items-center px-4">
                <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-3 h-3" /> Back to Code
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto">
                <h3 className="font-medium text-lg mb-2">Explain Your Thinking</h3>
                <p className="text-sm text-muted-foreground mb-6">Explain approach, complexity, trade-offs, and edge cases.</p>

                {includeCode && (
                  <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Your Code Preview:</p>
                    <pre className="text-xs font-mono overflow-x-auto max-h-32 text-foreground">{code.slice(0, 500)}</pre>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Type or use voice to explain..."
                    className="w-full min-h-[200px] p-4 rounded-lg border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button onClick={toggleRecording} className={`p-2 rounded-lg transition-colors ${isRecording ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{explanation.length} characters</p>
                  <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="h-10 px-8">
                    <Send className="w-4 h-4 mr-2" /> Submit Answer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
