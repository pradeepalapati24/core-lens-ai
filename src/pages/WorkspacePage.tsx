import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { mockQuestion } from "@/lib/mockData";
import { Mic, MicOff, Send, Lightbulb, ChevronDown, ChevronUp, BookOpen, Play } from "lucide-react";

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
  const [language, setLanguage] = useState("javascript");
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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Header bar */}
      <div className="h-10 border-b border-border bg-card/50 flex items-center px-4 gap-3 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">{meta?.domain || question.domain}</span>
        <span className="text-muted-foreground/50">→</span>
        <span className="text-xs text-muted-foreground">{meta?.topic || question.topic}</span>
        <span className="text-muted-foreground/50">→</span>
        <span className="text-xs text-muted-foreground">{meta?.subtopic || question.subtopic}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
          (meta?.difficulty || question.difficulty) === "beginner" ? "bg-accent/10 text-accent" :
          (meta?.difficulty || question.difficulty) === "intermediate" ? "bg-warning/10 text-warning" :
          "bg-destructive/10 text-destructive"
        }`}>
          {(meta?.difficulty || question.difficulty).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* Left: Question + Context */}
        <div className="lg:col-span-3 border-r border-border overflow-y-auto p-4">
          <h2 className="font-bold text-base mb-3">Problem</h2>
          <div className="prose prose-sm max-w-none">
            {question.questionText.split("\n").map((line, i) => {
              if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-bold mt-3 mb-1 text-foreground">{line.replace("## ", "")}</h2>;
              if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-semibold mt-2 mb-1 text-foreground">{line.replace("### ", "")}</h3>;
              if (line.startsWith("```")) return null;
              if (line.startsWith("- ")) return <li key={i} className="text-xs text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
              return <p key={i} className="text-xs text-foreground/80 mb-1">{line}</p>;
            })}
          </div>

          {/* Learning Context */}
          <div className="mt-5">
            <button onClick={() => setShowContext(!showContext)} className="flex items-center gap-2 text-xs font-semibold text-primary w-full">
              <BookOpen className="w-3.5 h-3.5" />
              Learning Context
              {showContext ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            </button>
            {showContext && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                {question.learningContext.split("\n").map((line, i) => (
                  <p key={i} className="text-xs text-muted-foreground mb-1">
                    {line.startsWith("**") ? <strong className="text-foreground">{line.replace(/\*\*/g, "")}</strong> : line}
                  </p>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Center: Code Editor */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <div className="h-9 bg-card/50 border-b border-border flex items-center px-4 gap-3">
            <span className="text-xs text-muted-foreground font-mono">solution.js</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="ml-auto text-xs bg-muted border border-border rounded px-2 py-1 text-muted-foreground"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="cpp">C++</option>
            </select>
            <button className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded hover:bg-accent/20 transition-colors">
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

        {/* Right: Explanation + Hints */}
        <div className="lg:col-span-3 border-l border-border flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-sm mb-3">Explain Your Thinking</h3>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain your approach, time/space complexity, and any trade-offs..."
              className="w-full h-36 bg-muted border border-border rounded-lg p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={toggleRecording}
              className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isRecording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-muted text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isRecording ? "Stop Recording" : "Voice Explain"}
            </button>

            {/* Hints */}
            <div className="mt-5">
              <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-xs font-semibold text-warning">
                <Lightbulb className="w-3.5 h-3.5" />
                Hints ({revealedHints}/{question.hints.length})
                {showHints ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </button>
              {showHints && (
                <div className="mt-2 space-y-2">
                  {question.hints.slice(0, revealedHints).map((h, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-warning/5 border border-warning/10 text-xs">{h}</div>
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
            <Button className="w-full h-10 font-semibold text-sm glow-primary" onClick={handleSubmit} disabled={!code.trim() || !explanation.trim()}>
              <Send className="w-3.5 h-3.5 mr-2" /> Submit Solution
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
