import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface HistoryItem {
  id: string;
  score: number | null;
  solved_at: string | null;
  questions: {
    question_text: string;
    difficulty: string;
    domains: { name: string } | null;
    topics: { name: string } | null;
  } | null;
}

export default function PracticeHistory({ userId }: { userId: string | null }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("user_solved_questions")
        .select(`id, score, solved_at, questions:question_id (question_text, difficulty, domains:domain_id (name), topics:topic_id (name))`)
        .eq("user_id", userId)
        .order("solved_at", { ascending: false })
        .limit(50);
      setHistory((data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayed = showAll ? history : history.slice(0, 10);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Practice History</h3>
        <span className="text-xs text-muted-foreground ml-auto">{history.length} total</span>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No practice history yet. Start solving questions!</p>
      ) : (
        <>
          <div className="space-y-1">
            {displayed.map((item) => {
              const score100 = Math.round((item.score || 0) * 10);
              const diffColor = item.questions?.difficulty === "advanced"
                ? "text-destructive" : item.questions?.difficulty === "intermediate"
                ? "text-warning" : "text-success";
              return (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.questions?.question_text?.slice(0, 80) || "Unknown question"}...</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">{item.questions?.domains?.name}</span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground">{item.questions?.topics?.name}</span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className={`text-[11px] font-medium ${diffColor}`}>{item.questions?.difficulty}</span>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.solved_at ? new Date(item.solved_at).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className={`font-mono text-sm font-bold ml-4 ${
                    score100 >= 70 ? "text-success" : score100 >= 50 ? "text-warning" : "text-destructive"
                  }`}>
                    {score100}
                  </div>
                </div>
              );
            })}
          </div>

          {history.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-3 mx-auto"
            >
              {showAll ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {history.length}</>}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
