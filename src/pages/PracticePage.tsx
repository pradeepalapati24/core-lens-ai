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
      <div className="flex gap-2 mb-6">
        {(["all", "it", "core"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${categoryFilter === c ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}
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
            className={`card-hover text-left p-[18px] ${selectedDomain?.id === d.id ? "border-primary/30" : ""}`}
          >
            <div className="text-xl mb-1.5">{d.icon}</div>
            <div className="font-medium text-sm">{d.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.description}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{d.topics.length} topics · {d.topics.reduce((a, t) => a + t.subtopics.length, 0)} subtopics</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Topic
    <div key="topic">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedDomain?.topics.map((t) => (
          <button
            key={t.id}
            onClick={() => { setSelectedTopic(t); setStep(2); }}
            className={`card-hover text-left p-[18px] ${selectedTopic?.id === t.id ? "border-primary/30" : ""}`}
          >
            <div className="font-medium text-sm">{t.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{t.subtopics.length} subtopics</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Subtopic
    <div key="subtopic">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {selectedTopic?.subtopics.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelectedSubtopic(s); setStep(3); }}
            className={`card-hover text-left p-[18px] ${selectedSubtopic?.id === s.id ? "border-primary/30" : ""}`}
          >
            <div className="font-medium text-sm">{s.name}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Difficulty
    <div key="difficulty">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {difficultyConfig.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDifficulty(d.value)}
            className={`card-hover p-6 text-center ${selectedDifficulty === d.value ? "border-primary/30" : ""}`}
          >
            <d.icon className={`w-6 h-6 mx-auto mb-2 ${d.color}`} />
            <div className="font-medium text-sm">{d.label}</div>
          </button>
        ))}
      </div>
      {selectedDifficulty && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
          <Button size="lg" className="h-10 px-8 text-sm font-medium" onClick={handleStart}>
            Start Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </motion.div>
      )}
    </div>,
  ];

  const stepLabels = ["Domain", "Topic", "Subtopic", "Difficulty"];
  const stepTitles = [
    "Select Domain",
    `Select Topic`,
    `Select Subtopic`,
    `Select Difficulty`,
  ];
  const stepDescs = [
    "Choose your engineering domain",
    selectedDomain?.name || "",
    `${selectedDomain?.name} → ${selectedTopic?.name}`,
    `${selectedDomain?.name} → ${selectedTopic?.name} → ${selectedSubtopic?.name}`,
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i + 1}
            </div>
            <span className={`text-xs hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            {i < 3 && <div className={`w-6 h-px ${i < step ? "bg-primary/50" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold mb-1">{stepTitles[step]}</h1>
        <p className="text-sm text-muted-foreground">{stepDescs[step]}</p>
      </div>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
