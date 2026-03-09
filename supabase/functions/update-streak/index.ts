import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = user.id;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Get or create streak record
    let { data: streak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!streak) {
      const { data: newStreak } = await supabase
        .from("user_streaks")
        .insert({ user_id: userId, current_streak: 1, longest_streak: 1, total_practice_days: 1, last_practice_date: today, streak_start_date: today })
        .select()
        .single();
      streak = newStreak;

      // Award first badges
      await checkAndAwardBadges(supabase, userId, 1, 1);

      return new Response(JSON.stringify({ streak, badges_awarded: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Already practiced today
    if (streak.last_practice_date === today) {
      return new Response(JSON.stringify({ streak, already_practiced: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let newCurrentStreak: number;
    let streakStartDate = streak.streak_start_date;
    let freezeUsed = false;

    if (streak.last_practice_date === yesterday) {
      // Consecutive day
      newCurrentStreak = streak.current_streak + 1;
    } else if (streak.last_practice_date) {
      // Gap detected — check for freeze protection
      const daysSinceLastPractice = Math.floor(
        (new Date(today).getTime() - new Date(streak.last_practice_date).getTime()) / 86400000
      );

      if (daysSinceLastPractice <= 2 && streak.streak_freeze_count > 0) {
        // Use a freeze
        newCurrentStreak = streak.current_streak + 1;
        freezeUsed = true;

        await supabase.from("streak_freezes").insert({
          user_id: userId,
          days_protected: daysSinceLastPractice - 1,
          reason: "auto_applied",
        });

        await supabase
          .from("user_streaks")
          .update({ streak_freeze_count: streak.streak_freeze_count - 1 })
          .eq("id", streak.id);
      } else {
        // Reset streak
        newCurrentStreak = 1;
        streakStartDate = today;
      }
    } else {
      newCurrentStreak = 1;
      streakStartDate = today;
    }

    const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);
    const newTotalDays = streak.total_practice_days + 1;

    await supabase
      .from("user_streaks")
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        total_practice_days: newTotalDays,
        last_practice_date: today,
        streak_start_date: streakStartDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", streak.id);

    // Count total questions solved
    const { count: totalQuestions } = await supabase
      .from("user_solved_questions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const badgesAwarded = await checkAndAwardBadges(supabase, userId, newCurrentStreak, totalQuestions || 0);

    const updatedStreak = {
      ...streak,
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      total_practice_days: newTotalDays,
      last_practice_date: today,
      streak_start_date: streakStartDate,
    };

    return new Response(
      JSON.stringify({ streak: updatedStreak, badges_awarded: badgesAwarded, freeze_used: freezeUsed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Streak update error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

async function checkAndAwardBadges(supabase: any, userId: string, currentStreak: number, totalQuestions: number) {
  const awarded: string[] = [];

  // Get all badges
  const { data: allBadges } = await supabase.from("badges").select("*").eq("is_active", true);
  if (!allBadges) return awarded;

  // Get user's existing badges
  const { data: userBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
  const earnedBadgeIds = new Set((userBadges || []).map((b: any) => b.badge_id));

  for (const badge of allBadges) {
    if (earnedBadgeIds.has(badge.id)) continue;

    let qualifies = false;
    if (badge.requirement_type === "consecutive_days" || badge.requirement_type === "streak_started") {
      qualifies = currentStreak >= badge.requirement_value;
    } else if (badge.requirement_type === "questions_solved" || badge.requirement_type === "total_questions") {
      qualifies = totalQuestions >= badge.requirement_value;
    }

    if (qualifies) {
      await supabase.from("user_badges").insert({
        user_id: userId,
        badge_id: badge.id,
        progress_value: badge.requirement_type.includes("streak") || badge.requirement_type === "consecutive_days" ? currentStreak : totalQuestions,
      });
      awarded.push(badge.name);
    }
  }

  return awarded;
}
