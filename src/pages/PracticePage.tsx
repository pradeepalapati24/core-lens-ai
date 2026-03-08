import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Zap, Signal, Gauge, Loader2, Clock } from "lucide-react";
import { useDomains, useTopics, useSubtopics, DbDomain, DbTopic, DbSubtopic } from "@/hooks/useDomains";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Difficulty = "beginner" | "intermediate" | "advanced";

const difficultyConfig: { value: Difficulty; label: string; icon: any; color: string; bgColor: string }[] = [
  { value: "beginner", label: "Beginner", icon: Zap, color: "text-success", bgColor: "bg-success/10" },
  { value: "intermediate", label: "Intermediate", icon: Signal, color: "text-warning", bgColor: "bg-warning/10" },
  { value: "advanced", label: "Advanced", icon: Gauge, color: "text-destructive", bgColor: "bg-destructive/10" },
];

export default function PracticePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = location.state as { selectedDomainId?: string; includeCode?: boolean } | null;

  const { data: domains = [], isLoading: domainsLoading } = useDomains();
  
  const [selectedDomain, setSelectedDomain] = useState<DbDomain | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<DbTopic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<DbSubtopic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "software" | "core">("all");
  const [includeCode, setIncludeCode] = useState<boolean>(incomingState?.includeCode ?? true);
  const [practiceMode, setPracticeMode] = useState<"regular" | "interview">("regular");

  const { data: topics = [], isLoading: topicsLoading } = useTopics(selectedDomain?.id || null);
  const { data: subtopics = [], isLoading: subtopicsLoading } = useSubtopics(selectedTopic?.id || null);

  // Set initial domain from incoming state
  useEffect(() => {
    if (incomingState?.selectedDomainId && domains.length > 0) {
      const domain = domains.find(d => d.id === incomingState.selectedDomainId);
      if (domain) setSelectedDomain(domain);
    }
  }, [incomingState?.selectedDomainId, domains]);

  // Update includeCode when domain changes
  useEffect(() => {
    if (selectedDomain) {
      setIncludeCode(selectedDomain.type === "software");
    }
  }, [selectedDomain]);

  // Reset dependent selections when parent changes
  useEffect(() => {
    setSelectedTopic(null);
    setSelectedSubtopic(null);
  }, [selectedDomain]);

  useEffect(() => {
    setSelectedSubtopic(null);
  }, [selectedTopic]);

  const filteredDomains = categoryFilter === "all" 
    ? domains 
    : domains.filter((d) => d.type === categoryFilter);

  const handleStart = () => {
    if (!selectedDomain || !selectedTopic || !selectedSubtopic || !selectedDifficulty) return;
    
    navigate("/workspace", {
      state: {
        domainId: selectedDomain.id,
        topicId: selectedTopic.id,
        subtopicId: selectedSubtopic.id,
        domain: selectedDomain.name,
        topic: selectedTopic.name,
        subtopic: selectedSubtopic.name,
        difficulty: selectedDifficulty,
        includeCode,
      },
    });
  };

  const canStart = selectedDomain && selectedTopic && selectedSubtopic && selectedDifficulty;

  if (domainsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[28px] font-semibold mb-1">Start Practice</h1>
        <p className="text-sm text-muted-foreground mb-8">Select your domain, topic, subtopic, and difficulty level</p>
      </motion.div>

      <div className="space-y-6">
        {/* Domain Selection */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.05 }}
          className="surface-elevated p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Domain</h2>
            <div className="flex gap-2">
              {(["all", "software", "core"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    categoryFilter === c 
                      ? "bg-primary/15 text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c === "all" ? "All" : c === "software" ? "Software" : "Core"}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredDomains.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d)}
                className={`text-left p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                  selectedDomain?.id === d.id 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/30 bg-card"
                }`}
              >
                <div className="text-xl mb-1">{d.icon}</div>
                <div className="font-medium text-sm truncate">{d.name}</div>
                <div className={`text-[10px] uppercase font-medium mt-1 ${
                  d.type === "software" ? "text-primary" : "text-success"
                }`}>
                  {d.type}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Topic Selection */}
        <AnimatePresence>
          {selectedDomain && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="surface-elevated p-6"
            >
              <h2 className="text-sm font-medium mb-4">Topic</h2>
              {topicsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading topics...</span>
                </div>
              ) : topics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No topics available for this domain.</p>
              ) : (
                <Select 
                  value={selectedTopic?.id || ""} 
                  onValueChange={(id) => setSelectedTopic(topics.find(t => t.id === id) || null)}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtopic Selection */}
        <AnimatePresence>
          {selectedTopic && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
              className="surface-elevated p-6"
            >
              <h2 className="text-sm font-medium mb-4">Subtopic</h2>
              {subtopicsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading subtopics...</span>
                </div>
              ) : subtopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">No subtopics available for this topic.</p>
              ) : (
                <Select 
                  value={selectedSubtopic?.id || ""} 
                  onValueChange={(id) => setSelectedSubtopic(subtopics.find(s => s.id === id) || null)}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Select a subtopic" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtopics.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Difficulty Selection */}
        <AnimatePresence>
          {selectedSubtopic && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: "auto" }} 
              exit={{ opacity: 0, height: 0 }}
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
          )}
        </AnimatePresence>

        {/* Practice Mode - shown after difficulty for software domains */}
        <AnimatePresence>
          {selectedDifficulty && selectedDomain?.type === "software" && (
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
            disabled={!canStart}
          >
            Start Practice <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          {canStart && (
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{selectedDomain?.name}</span>
                {" → "}
                <span className="font-medium text-foreground">{selectedTopic?.name}</span>
                {" → "}
                <span className="font-medium text-foreground">{selectedSubtopic?.name}</span>
                {" · "}
                <span className={`font-medium ${
                  selectedDifficulty === "beginner" ? "text-success" :
                  selectedDifficulty === "intermediate" ? "text-warning" : "text-destructive"
                }`}>
                  {selectedDifficulty?.charAt(0).toUpperCase()}{selectedDifficulty?.slice(1)}
                </span>
                {selectedDomain?.type === "software" && (
                  <span className="ml-2 text-primary">
                    · {includeCode ? "Code + Theory" : "Theory Only"}
                  </span>
                )}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
