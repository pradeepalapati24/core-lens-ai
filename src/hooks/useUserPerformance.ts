import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PerformanceData {
  id: string;
  user_id: string;
  domain_id: string | null;
  topic_id: string | null;
  subtopic_id: string | null;
  total_questions: number;
  correct_questions: number;
  avg_score: number;
  last_practiced_at: string | null;
}

export interface DomainPerformance extends PerformanceData {
  domain_name: string;
  domain_icon: string;
}

export interface TopicPerformance extends PerformanceData {
  topic_name: string;
  domain_name: string;
}

export function useUserPerformance(userId: string | null) {
  return useQuery({
    queryKey: ["user-performance", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_performance")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data as PerformanceData[];
    },
    enabled: !!userId,
  });
}

export function useDomainPerformance(userId: string | null) {
  return useQuery({
    queryKey: ["domain-performance", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_performance")
        .select(`
          *,
          domains:domain_id (name, icon)
        `)
        .eq("user_id", userId)
        .not("domain_id", "is", null)
        .is("topic_id", null)
        .is("subtopic_id", null);
      
      if (error) throw error;
      
      return (data || []).map((d: any) => ({
        ...d,
        domain_name: d.domains?.name || "Unknown",
        domain_icon: d.domains?.icon || "📚",
      })) as DomainPerformance[];
    },
    enabled: !!userId,
  });
}

export function useTopicPerformance(userId: string | null, domainId?: string) {
  return useQuery({
    queryKey: ["topic-performance", userId, domainId],
    queryFn: async () => {
      if (!userId) return [];
      let query = supabase
        .from("user_performance")
        .select(`
          *,
          topics:topic_id (name, domain_id),
          domains:domain_id (name)
        `)
        .eq("user_id", userId)
        .not("topic_id", "is", null)
        .is("subtopic_id", null);
      
      if (domainId) {
        query = query.eq("domain_id", domainId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map((d: any) => ({
        ...d,
        topic_name: d.topics?.name || "Unknown",
        domain_name: d.domains?.name || "Unknown",
      })) as TopicPerformance[];
    },
    enabled: !!userId,
  });
}

export function getStrongWeakDomains(performance: DomainPerformance[]) {
  if (!performance.length) return { strong: [], weak: [], recommendations: [] };
  
  const sorted = [...performance].sort((a, b) => b.avg_score - a.avg_score);
  const strong = sorted.filter(p => p.avg_score >= 7);
  const weak = sorted.filter(p => p.avg_score < 6 && p.total_questions > 0);
  const recommendations = weak.slice(0, 5);
  
  return { strong, weak, recommendations };
}

export function getStrongWeakTopics(performance: TopicPerformance[]) {
  if (!performance.length) return { strong: [], weak: [] };
  
  const sorted = [...performance].sort((a, b) => b.avg_score - a.avg_score);
  const strong = sorted.filter(p => p.avg_score >= 7);
  const weak = sorted.filter(p => p.avg_score < 6 && p.total_questions > 0);
  
  return { strong, weak };
}
