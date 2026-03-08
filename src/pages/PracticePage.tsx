import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { domains } from "@/lib/domains";
import { Domain, Topic, Subtopic, Difficulty } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap, Signal, Gauge } from "lucide-react";

const difficultyConfig: { value: Difficulty; label: string; icon: any; color: string }[] = [
  { value: "beginner", label: "Beginner", icon: Zap, color: "text-accent" },
  { value: "intermediate", label: "Intermediate", icon: Signal, color: "text-warning" },
  { value: "advanced", label: "Advanced", icon: Gauge, color: "text-destructive" },
];

export default function PracticePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "it" | "core">("all");

  const filteredDomains = categoryFilter === "all" ? domains : domains.filter((d) => d.category === categoryFilter);

  const handleStart = () => {
    navigate("/workspace", {
      state: {
        domain: selectedDomain?.name,
        topic: selectedTopic?.name,
        subtopic: selectedSubtopic?.name,
        difficulty: selectedDifficulty,
      },
    });
  };

  const steps = [
    // Step 0: Domain
    <div key="domain">
      <h2 className="text-2xl font-bold mb-2">Select Domain</h2>
      <p className="text-muted-foreground text-sm mb-6">Choose your engineering domain</p>
      <div className="flex gap-2 mb-6">
        {(["all", "it", "core"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-surface-hover"}`}
          >
            {c === "all" ? "All" : c === "it" ? "IT / Software" : "Core / Hardware"}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDomains.map((d) => (
          <button
            key={d.id}
            onClick={() => { setSelectedDomain(d); setStep(1); }}
            className={`card-glow text-left p-5 rounded-xl transition-all ${selectedDomain?.id === d.id ? "border-primary bg-primary/5" : ""}`}
          >
            <div className="text-2xl mb-2">{d.icon}</div>
            <div className="font-semibold">{d.name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{d.description}</div>
            <div className="mt-3 text-xs text-muted-foreground">{d.topics.length} topics · {d.topics.reduce((a, t) => a + t.subtopics.length, 0)} subtopics</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Topic
    <div key="topic">
      <h2 className="text-2xl font-bold mb-2">Select Topic</h2>
      <p className="text-muted-foreground text-sm mb-6">{selectedDomain?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedDomain?.topics.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSelectedTopic(t); setStep(2); }}
            className={`card-glow text-left p-5 rounded-xl transition-all ${selectedTopic?.id === t.id ? "border-primary bg-primary/5" : ""}`}
          >
            <div className="font-semibold">{t.name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{t.subtopics.length} subtopics</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Subtopic
    <div key="subtopic">
      <h2 className="text-2xl font-bold mb-2">Select Subtopic</h2>
      <p className="text-muted-foreground text-sm mb-6">{selectedDomain?.name} → {selectedTopic?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedTopic?.subtopics.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelectedSubtopic(s); setStep(3); }}
            className={`card-glow text-left p-5 rounded-xl transition-all ${selectedSubtopic?.id === s.id ? "border-primary bg-primary/5" : ""}`}
          >
            <div className="font-semibold">{s.name}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Difficulty
    <div key="difficulty">
      <h2 className="text-2xl font-bold mb-2">Select Difficulty</h2>
      <p className="text-muted-foreground text-sm mb-6">{selectedDomain?.name} → {selectedTopic?.name} → {selectedSubtopic?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {difficultyConfig.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDifficulty(d.value)}
            className={`card-glow p-8 rounded-xl text-center transition-all ${selectedDifficulty === d.value ? "border-primary bg-primary/5" : ""}`}
          >
            <d.icon className={`w-8 h-8 mx-auto mb-3 ${d.color}`} />
            <div className="font-semibold text-lg">{d.label}</div>
          </button>
        ))}
      </div>
      {selectedDifficulty && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
          <Button size="lg" className="h-12 px-10 text-base font-semibold glow-primary" onClick={handleStart}>
            Start Question <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>,
  ];

  return (
    <div className="p-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {["Domain", "Topic", "Subtopic", "Difficulty"].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < 3 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
