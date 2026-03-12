import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useTopics, useSubtopics, DbTopic, DbSubtopic } from "@/hooks/useDomains";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TopicSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { domainId: string; domainName: string; domainType: string; domainIcon: string } | null;

  const [selectedTopic, setSelectedTopic] = useState<DbTopic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<DbSubtopic | null>(null);

  const { data: topics = [], isLoading: topicsLoading } = useTopics(state?.domainId || null);
  const { data: subtopics = [], isLoading: subtopicsLoading } = useSubtopics(selectedTopic?.id || null);

  useEffect(() => {
    setSelectedSubtopic(null);
  }, [selectedTopic]);

  // Redirect if no domain state
  useEffect(() => {
    if (!state?.domainId) {
      navigate("/domains");
    }
  }, [state, navigate]);

  if (!state) return null;

  const handleContinue = () => {
    if (!selectedTopic || !selectedSubtopic) return;
    navigate("/practice", {
      state: {
        domainId: state.domainId,
        domainName: state.domainName,
        domainType: state.domainType,
        domainIcon: state.domainIcon,
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        subtopicId: selectedSubtopic.id,
        subtopicName: selectedSubtopic.name,
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

        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">{state.domainIcon}</span>
          <div>
            <h1 className="text-[28px] font-semibold">{state.domainName}</h1>
            <p className="text-sm text-muted-foreground">Select a topic and subtopic to continue</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Topic Selection */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
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
              <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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

        {/* Continue Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="pt-4">
          <Button
            size="lg"
            className="w-full h-12 text-sm font-medium"
            onClick={handleContinue}
            disabled={!selectedTopic || !selectedSubtopic}
          >
            Continue to Practice <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {selectedTopic && selectedSubtopic && (
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{state.domainName}</span>
                {" → "}
                <span className="font-medium text-foreground">{selectedTopic.name}</span>
                {" → "}
                <span className="font-medium text-foreground">{selectedSubtopic.name}</span>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
