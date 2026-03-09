import { motion } from "framer-motion";
import { Flame, Trophy, Snowflake, Shield, Lock, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStreak } from "@/hooks/useStreak";
import { toast } from "@/hooks/use-toast";

interface StreakDisplayProps {
  userId: string;
}

export default function StreakDisplay({ userId }: StreakDisplayProps) {
  const { streak, userBadges, allBadges, isLoading, useFreeze } = useStreak(userId);

  if (isLoading) return null;

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalDays = streak?.total_practice_days || 0;
  const freezesAvailable = streak?.streak_freeze_count || 0;

  const earnedBadgeIds = new Set(userBadges.map((ub: any) => ub.badge_id));

  // Next milestone
  const streakBadges = allBadges
    .filter((b) => b.requirement_type === "consecutive_days")
    .sort((a, b) => a.requirement_value - b.requirement_value);
  const nextMilestone = streakBadges.find((b) => b.requirement_value > currentStreak);
  const milestoneProgress = nextMilestone
    ? Math.min((currentStreak / nextMilestone.requirement_value) * 100, 100)
    : 100;

  const handleUseFreeze = async () => {
    try {
      await useFreeze.mutateAsync();
      toast({ title: "❄️ Streak Freeze Used", description: "Your streak is protected for today!" });
    } catch {
      toast({ title: "Error", description: "No freezes available", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Streak Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: "Current Streak", value: `${currentStreak}`, sub: "days", color: "text-warning", bg: "bg-warning/8" },
          { icon: Trophy, label: "Longest Streak", value: `${longestStreak}`, sub: "days", color: "text-primary", bg: "bg-primary/8" },
          { icon: Calendar, label: "Total Practice", value: `${totalDays}`, sub: "days", color: "text-foreground", bg: "bg-muted" },
          { icon: Snowflake, label: "Streak Freezes", value: `${freezesAvailable}`, sub: "available", color: "text-info", bg: "bg-info/8" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="surface-elevated p-5">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Next Milestone</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {currentStreak}/{nextMilestone.requirement_value} days
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">{nextMilestone.icon}</span>
            <div className="flex-1">
              <span className="text-sm font-medium">{nextMilestone.name}</span>
              <p className="text-xs text-muted-foreground">{nextMilestone.description}</p>
            </div>
          </div>
          <Progress value={milestoneProgress} className="h-2" />
        </motion.div>
      )}

      {/* Freeze Action */}
      {freezesAvailable > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-info" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Streak Protection</h3>
                <p className="text-xs text-muted-foreground">
                  {freezesAvailable} freeze{freezesAvailable !== 1 ? "s" : ""} available — protect your streak if you miss a day
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleUseFreeze} disabled={useFreeze.isPending}>
              <Snowflake className="w-3 h-3" /> Use Freeze
            </Button>
          </div>
        </motion.div>
      )}

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated p-5">
        <h3 className="text-sm font-semibold mb-1">Badges & Milestones</h3>
        <p className="text-xs text-muted-foreground mb-4">Earn badges by maintaining streaks and solving questions</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {allBadges.slice(0, 12).map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                  earned
                    ? "bg-primary/5 border-primary/20"
                    : "bg-muted/30 border-border opacity-50"
                }`}
              >
                <span className="text-2xl">{earned ? badge.icon : "🔒"}</span>
                <span className="text-[10px] font-medium text-center leading-tight">{badge.name}</span>
                {earned && (
                  <span className="text-[9px] text-primary font-semibold">Earned</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
