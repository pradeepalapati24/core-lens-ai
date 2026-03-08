import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbDomain {
  id: string;
  name: string;
  type: "core" | "software";
  icon: string | null;
  description: string | null;
}

export interface DbTopic {
  id: string;
  domain_id: string;
  name: string;
}

export interface DbSubtopic {
  id: string;
  topic_id: string;
  name: string;
}

export function useDomains() {
  return useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as DbDomain[];
    },
  });
}

export function useTopics(domainId: string | null) {
  return useQuery({
    queryKey: ["topics", domainId],
    queryFn: async () => {
      if (!domainId) return [];
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("domain_id", domainId)
        .order("name");
      if (error) throw error;
      return data as DbTopic[];
    },
    enabled: !!domainId,
  });
}

export function useSubtopics(topicId: string | null) {
  return useQuery({
    queryKey: ["subtopics", topicId],
    queryFn: async () => {
      if (!topicId) return [];
      const { data, error } = await supabase
        .from("subtopics")
        .select("*")
        .eq("topic_id", topicId)
        .order("name");
      if (error) throw error;
      return data as DbSubtopic[];
    },
    enabled: !!topicId,
  });
}

export function useUserSolvedQuestions(userId: string | null) {
  return useQuery({
    queryKey: ["user-solved-questions", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_solved_questions")
        .select("question_id")
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((d) => d.question_id);
    },
    enabled: !!userId,
  });
}
