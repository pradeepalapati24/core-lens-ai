import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Brain, Code2, BarChart3, ArrowRight, 
  ChevronRight, X, Zap, Target, BookOpen 
} from "lucide-react";

const ONBOARDING_KEY = "corelens_onboarding_complete";

const steps = [
  {
    icon: Sparkles,
    title: "Welcome to CoreLens! 🎯",
    description: "We'll help you master the art of technical explanation. Let's walk through how it works in 30 seconds.",
    accent: "primary",
  },
  {
    icon: BookOpen,
    title: "Choose Your Domain",
    description: "Pick from 12 engineering domains — Data Structures, VLSI, Control Systems, and more. Each has topics and subtopics for focused practice.",
    accent: "primary",
  },
  {
    icon: Brain,
    title: "Explain, Don't Just Solve",
    description: "You'll get a question, then write your explanation (and optionally code). The AI evaluates your reasoning clarity, depth, and communication — not just correctness.",
    accent: "primary",
  },
  {
    icon: BarChart3,
    title: "Track Your Growth",
    description: "Every evaluation builds your skill profile. See your strengths, weak areas, and interview readiness score evolve over time.",
    accent: "primary",
  },
  {
    icon: Target,
    title: "Let's Start Your First Question!",
    description: "We'll take you to the practice page where you can pick a domain and start your first evaluation. Ready?",
    accent: "primary",
  },
];

interface OnboardingFlowProps {
  userId: string;
  hasSolvedQuestions: boolean;
}

export default function OnboardingFlow({ userId, hasSolvedQuestions }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const key = `${ONBOARDING_KEY}_${userId}`;
    const completed = localStorage.getItem(key);
    if (!completed && !hasSolvedQuestions) {
      setVisible(true);
    }
  }, [userId, hasSolvedQuestions]);

  const dismiss = () => {
    localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
      navigate("/practice");
    }
  };

  const skip = () => {
    dismiss();
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={skip} />

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={skip}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="p-8 pt-7">
            {/* Icon */}
            <motion.div
              key={`icon-${step}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5"
            >
              <Icon className="w-7 h-7 text-primary" />
            </motion.div>

            {/* Content */}
            <motion.div
              key={`content-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-xl font-bold mb-2">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
            </motion.div>

            {/* Step indicator dots */}
            <div className="flex items-center gap-1.5 mt-6 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={skip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <Button onClick={next} size="sm" className="h-9 px-5 text-sm font-medium gap-1.5">
                {isLast ? (
                  <>Start Practicing <Zap className="w-3.5 h-3.5" /></>
                ) : (
                  <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
