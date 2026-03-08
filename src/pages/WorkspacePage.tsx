import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Lightbulb, ChevronDown, ChevronUp, BookOpen, Play, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GeneratedQuestion {
  id: string;
  domain: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  questionText: string;
  learningContext: string;
  hints: string[];
  expectedConcepts: string[];
  createdAt: string;
}

export default function WorkspacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const meta = location.state as any;

  // Check if code should be included (IT domains can choose, Core domains always theory-only)
  const includeCode = meta?.includeCode !== false;

  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [code, setCode] = useState(`// Write your solution here\n\nfunction solution() {\n  \n}\n`);
  const [explanation, setExplanation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showContext, setShowContext] = useState(true);
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState("");
  const recognitionRef = useRef<any>(null);

  // Fetch question on mount
  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = async () => {
    setIsLoadingQuestion(true);
    setRevealedHints(0);
    
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
            domain: meta?.domain || "Data Structures",
            topic: meta?.topic || "Trees",
            subtopic: meta?.subtopic || "Binary Search Tree",
            difficulty: meta?.difficulty || "intermediate",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate question");
      }

      const questionData = await response.json();
      setQuestion(questionData);
    } catch (error) {
      console.error("Error generating question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate question. Please try again.",
      });
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

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
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
    
    setIsSubmitting(true);
    
    const evaluationSteps = [
      "Analyzing reasoning...",
      "Evaluating code quality...",
      "Checking edge cases...",
      "Generating feedback...",
    ];

    let stepIndex = 0;
    setEvaluationStep(evaluationSteps[0]);
    
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < evaluationSteps.length) {
        setEvaluationStep(evaluationSteps[stepIndex]);
      }
    }, 1500);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            problem: question.questionText,
            code: includeCode ? code : null,
            explanation,
            domain: question.domain,
            topic: question.topic,
          }),
        }
      );

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            variant: "destructive",
            title: "Rate Limited",
            description: "Too many requests. Please wait a moment and try again.",
          });
        } else if (response.status === 402) {
          toast({
            variant: "destructive",
            title: "Payment Required",
            description: "Please add funds to continue using AI evaluation.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Evaluation Failed",
            description: errorData.error || "Something went wrong. Please try again.",
          });
        }
        setIsSubmitting(false);
        return;
      }

      const evaluation = await response.json();
      
      navigate("/evaluation", {
        state: {
          code: includeCode ? code : null,
          explanation,
          question,
          includeCode,
          evaluation,
          domain: question.domain,
          topic: question.topic,
        },
      });
    } catch (error) {
      clearInterval(stepInterval);
      console.error("Evaluation error:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the evaluation service.",
      });
      setIsSubmitting(false);
    }
  };

  // Determine if submit button should be enabled
  const canSubmit = question && (includeCode ? (code.trim() && explanation.trim()) : explanation.trim());

  // Loading state
  if (isLoadingQuestion) {
    return (
      <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Generating Question</h3>
          <p className="text-sm text-muted-foreground">
            Creating a {meta?.difficulty || "intermediate"} question for {meta?.subtopic || "your selected topic"}...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="h-[calc(100vh-3rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Failed to load question</p>
          <Button onClick={generateQuestion}>
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      {/* Breadcrumb bar */}
      <div className="h-9 border-b border-border flex items-center px-4 gap-2 shrink-0 text-xs text-muted-foreground">
        <span>{question.domain}</span>
        <span className="opacity-30">/</span>
        <span>{question.topic}</span>
        <span className="opacity-30">/</span>
        <span>{question.subtopic}</span>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={generateQuestion}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Generate new question"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          {!includeCode && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent">
              THEORY
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
            question.difficulty === "beginner" ? "bg-accent/10 text-accent" :
            question.difficulty === "intermediate" ? "bg-warning/10 text-warning" :
            "bg-destructive/10 text-destructive"
          }`}>
            {question.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Evaluation Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-8 text-center max-w-sm"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Evaluating Submission</h3>
            <p className="text-sm text-muted-foreground">{evaluationStep}</p>
          </motion.div>
        </div>
      )}

      <div className={`flex-1 grid grid-cols-1 ${includeCode ? 'lg:grid-cols-12' : 'lg:grid-cols-2'} min-h-0`}>
        {/* Left: Question */}
        <div className={`${includeCode ? 'lg:col-span-3' : 'lg:col-span-1'} border-r border-border overflow-y-auto p-5`}>
          <h2 className="font-medium text-sm mb-3">Problem</h2>
          <div className="prose prose-sm max-w-none">
            {question.questionText.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground">{line.replace("## ", "")}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-medium mt-2 mb-1 text-foreground">{line.replace("### ", "")}</h3>;
              if (line.startsWith("```")) return null;
              if (line.startsWith("- ")) return <li key={i} className="text-xs text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
              return <p key={i} className="text-xs text-muted-foreground mb-1">{line}</p>;
            })}
          </div>

          <div className="mt-5">
            <button onClick={() => setShowContext(!showContext)} className="flex items-center gap-2 text-xs font-medium text-primary w-full">
              <BookOpen className="w-3.5 h-3.5" />
              Learning Context
              {showContext ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            {showContext && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 p-3 rounded-lg bg-primary/5 border border-border">
                <p className="text-xs text-muted-foreground">{question.learningContext}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Center: Editor (only shown when includeCode is true) */}
        {includeCode && (
          <div className="lg:col-span-6 flex flex-col min-h-0">
            <div className="h-9 border-b border-border flex items-center px-4 gap-3">
              <span className="text-xs text-muted-foreground font-mono">solution.js</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="ml-auto text-xs bg-muted/40 border border-border rounded px-2 py-1 text-muted-foreground"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
              </select>
              <button className="flex items-center gap-1 text-xs text-accent px-2 py-1 rounded hover:bg-accent/10 transition-colors">
                <Play className="w-3 h-3" /> Run
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage={language}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "JetBrains Mono",
                  padding: { top: 12 },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>
        )}

        {/* Right: Explanation */}
        <div className={`${includeCode ? 'lg:col-span-3' : 'lg:col-span-1'} border-l border-border flex flex-col min-h-0`}>
          <div className="flex-1 overflow-y-auto p-5">
            <h3 className="font-medium text-sm mb-3">
              {includeCode ? "Explain Your Thinking" : "Your Answer & Explanation"}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {includeCode
                ? "Explain your approach, time/space complexity, and any trade-offs..."
                : "Provide a detailed explanation of the concept, your understanding, and real-world applications..."
              }
            </p>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder={includeCode
                ? "Explain your approach, time/space complexity, and any trade-offs..."
                : "Write your detailed answer here. Include key concepts, formulas, diagrams descriptions, and practical examples..."
              }
              className={`w-full bg-muted/30 border border-border rounded-lg p-3 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                includeCode ? 'h-36' : 'h-64'
              }`}
            />
            <button
              onClick={toggleRecording}
              className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isRecording ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isRecording ? "Stop Recording" : "Voice Explain"}
            </button>

            <div className="mt-5">
              <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-xs font-medium text-warning">
                <Lightbulb className="w-3.5 h-3.5" />
                Hints ({revealedHints}/{question.hints.length})
                {showHints ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
              {showHints && (
                <div className="mt-2 space-y-2">
                  {question.hints.slice(0, revealedHints).map((h, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-warning/5 border border-border text-xs">{h}</div>
                  ))}
                  {revealedHints < question.hints.length && (
                    <button
                      onClick={() => setRevealedHints(revealedHints + 1)}
                      className="text-xs text-warning hover:underline"
                    >
                      Reveal next hint
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <Button 
              className="w-full h-9 font-medium text-sm" 
              onClick={handleSubmit} 
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" /> {includeCode ? "Submit Solution" : "Submit Answer"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
