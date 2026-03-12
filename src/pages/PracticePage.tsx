import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap, Signal, Gauge, Clock } from "lucide-react";

type Difficulty = "beginner" | "intermediate" | "advanced";

const difficultyConfig: { value: Difficulty; label: string; icon: any; color: string; bgColor: string }[] = [
  { value: "beginner", label: "Beginner", icon: Zap, color: "text-success", bgColor: "bg-success/10" },
  { value: "intermediate", label: "Intermediate", icon: Signal, color: "text-warning", bgColor: "bg-warning/10" },
  { value: "advanced", label: "Advanced", icon: Gauge, color: "text-destructive", bgColor: "bg-destructive/10" },
];

interface IncomingState {
  domainId: string;
  domainName: string;
  domainType: string;
  domainIcon: string;
  topicId: string;
  topicName: string;
  subtopicId: string;
  subtopicName: string;
}

export default function PracticePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as IncomingState | null;

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [includeCode, setIncludeCode] = useState<boolean>(true);
  const [practiceMode, setPracticeMode] = useState<"regular" | "interview">("regular");

  useEffect(() => {
    if (!state?.domainId) {
      navigate("/domains");
    }
  }, [state, navigate]);

  useEffect(() => {
    if (state?.domainType) {
      setIncludeCode(state.domainType === "software");
    }
  }, [state?.domainType]);

  if (!state) return null;

  const handleStart = () => {
    if (!selectedDifficulty) return;

    const targetRoute = practiceMode === "interview" ? "/interview" : "/workspace";
    navigate(targetRoute, {
      state: {
        domainId: state.domainId,
        topicId: state.topicId,
        subtopicId: state.subtopicId,
        domain: state.domainName,
        topic: state.topicName,
        subtopic: state.subtopicName,
        difficulty: selectedDifficulty,
        includeCode,
      },
    });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate("/domains")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Domains
        </button>

        <h1 className="text-[28px] font-semibold mb-1">Start Practice</h1>
        <p className="text-sm text-muted-foreground mb-2">Configure your session settings</p>

        {/* Selection summary */}
        <div className="mb-8 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-lg mr-2">{state.domainIcon}</span>
            <span className="font-medium text-foreground">{state.domainName}</span>
            {" → "}
            <span className="font-medium text-foreground">{state.topicName}</span>
            {" → "}
            <span className="font-medium text-foreground">{state.subtopicName}</span>
          </p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Difficulty Selection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="surface-elevated p-6"
        >
          <h2 className="text-sm font-medium mb-4">Difficulty Level</h2>
          <div className="grid grid-cols-3 gap-4">
            {difficultyConfig.map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDifficulty(d.value)}
                className={`p-4 rounded-lg border text-center transition-all hover:scale-[1.02] ${
                  selectedDifficulty === d.value
                    ? `border-primary ${d.bgColor}`
                    : "border-border hover:border-primary/30 bg-card"
                }`}
              >
                <d.icon className={`w-5 h-5 mx-auto mb-2 ${d.color}`} />
                <div className="font-medium text-sm">{d.label}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Practice Mode - shown for software domains */}
        <AnimatePresence>
          {selectedDifficulty && state.domainType === "software" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="surface-elevated p-6"
            >
              <h2 className="text-sm font-medium mb-2">Practice Mode</h2>
              <p className="text-xs text-muted-foreground mb-4">How would you like to answer this question?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIncludeCode(true)}
                  className={`p-4 rounded-lg border text-center transition-all hover:scale-[1.02] ${
                    includeCode ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">Code + Explanation</div>
                  <p className="text-[11px] text-muted-foreground">Write code and explain your approach</p>
                </button>
                <button
                  onClick={() => setIncludeCode(false)}
                  className={`p-4 rounded-lg border text-center transition-all hover:scale-[1.02] ${
                    !includeCode ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">Theory Only</div>
                  <p className="text-[11px] text-muted-foreground">Focus on concepts and explanation</p>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Type */}
        <AnimatePresence>
          {selectedDifficulty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="surface-elevated p-6"
            >
              <h2 className="text-sm font-medium mb-2">Session Type</h2>
              <p className="text-xs text-muted-foreground mb-4">Choose your practice experience</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPracticeMode("regular")}
                  className={`p-4 rounded-lg border text-center transition-all hover:scale-[1.02] ${
                    practiceMode === "regular" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <ArrowRight className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="font-medium text-sm mb-1">Regular Practice</div>
                  <p className="text-[11px] text-muted-foreground">No time limit, learn at your pace</p>
                </button>
                <button
                  onClick={() => setPracticeMode("interview")}
                  className={`p-4 rounded-lg border text-center transition-all hover:scale-[1.02] ${
                    practiceMode === "interview" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-2 text-warning" />
                  <div className="font-medium text-sm mb-1">Interview Simulation</div>
                  <p className="text-[11px] text-muted-foreground">Timed session with countdown pressure</p>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="pt-4"
        >
          <Button
            size="lg"
            className="w-full h-12 text-sm font-medium"
            onClick={handleStart}
            disabled={!selectedDifficulty}
          >
            Start Practice <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
