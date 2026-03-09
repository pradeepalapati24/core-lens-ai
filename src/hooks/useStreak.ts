import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStreak(userId: string | null) {
  const queryClient = useQueryClient();

  const streakQuery = useQuery({
    queryKey: ["streak", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const badgesQuery = useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });

  const allBadgesQuery = useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("requirement_value", { ascending: true });
      return data || [];
    },
  });

  const updateStreak = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-streak`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (!res.ok) throw new Error("Failed to update streak");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-badges", userId] });
    },
  });

  const useFreeze = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user");
      const streak = streakQuery.data;
      if (!streak || streak.streak_freeze_count <= 0) throw new Error("No freezes available");
      
      await supabase.from("streak_freezes").insert({
        user_id: userId,
        days_protected: 1,
        reason: "manual_freeze",
      });
      
      await supabase
        .from("user_streaks")
        .update({ streak_freeze_count: Math.max(0, streak.streak_freeze_count - 1) })
        .eq("user_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak", userId] });
    },
  });

  return {
    streak: streakQuery.data,
    userBadges: badgesQuery.data || [],
    allBadges: allBadgesQuery.data || [],
    isLoading: streakQuery.isLoading,
    updateStreak,
    useFreeze,
  };
}
