import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { mockQuestion } from "@/lib/mockData";
import { Mic, MicOff, Send, Lightbulb, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

export default function WorkspacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const meta = location.state as any;

  const [code, setCode] = useState(`// Write your solution here\n\nfunction isValidBST(root) {\n  \n}\n`);
  const [explanation, setExplanation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showContext, setShowContext] = useState(true);
  const recognitionRef = useRef<any>(null);

  const question = mockQuestion;

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

  const handleSubmit = () => {
    navigate("/evaluation", { state: { code, explanation, question } });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header bar */}
      <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-4">
        <span className="text-sm font-medium">{meta?.domain || question.domain}</span>
        <span className="text-muted-foreground">→</span>
        <span className="text-sm">{meta?.topic || question.topic}</span>
        <span className="text-muted-foreground">→</span>
        <span className="text-sm">{meta?.subtopic || question.subtopic}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          (meta?.difficulty || question.difficulty) === "beginner" ? "bg-primary/10 text-primary" :
          (meta?.difficulty || question.difficulty) === "intermediate" ? "bg-accent/10 text-accent" :
          "bg-destructive/10 text-destructive"
        }`}>
          {(meta?.difficulty || question.difficulty).toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-7rem)]">
        {/* Left: Question + Context */}
        <div className="lg:col-span-3 border-r border-border overflow-y-auto p-4">
          <h2 className="font-bold text-lg mb-4">Question</h2>
          <div className="prose prose-sm prose-invert max-w-none">
            {question.questionText.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold mt-4 mb-2">{line.replace("## ", "")}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold mt-3 mb-1">{line.replace("### ", "")}</h3>;
              if (line.startsWith("```")) return null;
              if (line.startsWith("- ")) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
              return <p key={i} className="text-sm text-foreground/90 mb-1">{line}</p>;
            })}
          </div>

          {/* Learning Context */}
          <div className="mt-6">
            <button onClick={() => setShowContext(!showContext)} className="flex items-center gap-2 text-sm font-semibold text-primary w-full">
              <BookOpen className="w-4 h-4" />
              Learning Context
              {showContext ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            {showContext && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                {question.learningContext.split("\n").map((line, i) => (
                  <p key={i} className="text-sm text-muted-foreground mb-1">
                    {line.startsWith("**") ? <strong className="text-foreground">{line.replace(/\*\*/g, "")}</strong> : line}
                  </p>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Center: Code Editor */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="h-8 bg-card border-b border-border flex items-center px-4">
            <span className="text-xs text-muted-foreground font-mono">solution.js</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "JetBrains Mono",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>
        </div>

        {/* Right: Explanation + Hints */}
        <div className="lg:col-span-3 border-l border-border flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold mb-3">Explain Your Thinking</h3>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain your approach, time/space complexity, and any trade-offs..."
              className="w-full h-40 bg-muted border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={toggleRecording}
              className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary text-secondary-foreground hover:bg-surface-hover"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? "Stop Recording" : "Voice Explain"}
            </button>

            {/* Hints */}
            <div className="mt-6">
              <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Lightbulb className="w-4 h-4" />
                Hints ({revealedHints}/{question.hints.length})
                {showHints ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
              {showHints && (
                <div className="mt-3 space-y-2">
                  {question.hints.slice(0, revealedHints).map((h, i) => (
                    <div key={i} className="p-3 rounded-lg bg-accent/5 border border-accent/10 text-sm">{h}</div>
                  ))}
                  {revealedHints < question.hints.length && (
                    <button
                      onClick={() => setRevealedHints(revealedHints + 1)}
                      className="text-sm text-accent hover:underline"
                    >
                      Reveal next hint
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <Button className="w-full h-11 font-semibold glow-primary" onClick={handleSubmit} disabled={!code.trim() || !explanation.trim()}>
              <Send className="w-4 h-4 mr-2" /> Submit Solution
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
