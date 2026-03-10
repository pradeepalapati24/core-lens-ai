import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, Flame, AlertTriangle, Info, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  link: string | null;
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications((data as Notification[]) || []);
    };
    fetchNotifications();

    // Generate streak/practice notifications if none exist
    const generateDefaultNotifications = async () => {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (!existing || existing.length === 0) {
        const { data: streak } = await supabase
          .from("user_streaks")
          .select("current_streak, streak_freeze_count")
          .eq("user_id", userId)
          .single();

        const defaultNotifs = [];

        if (streak && streak.current_streak > 0) {
          defaultNotifs.push({
            user_id: userId,
            title: "🔥 Streak Active!",
            message: `You're on a ${streak.current_streak}-day streak! Don't break it — practice today.`,
            type: "streak",
          });
        }

        if (streak && streak.streak_freeze_count > 0) {
          defaultNotifs.push({
            user_id: userId,
            title: "❄️ Streak Freeze Available",
            message: `You have ${streak.streak_freeze_count} streak freeze(s). They'll auto-apply if you miss a day.`,
            type: "info",
          });
        }

        defaultNotifs.push({
          user_id: userId,
          title: "💡 Tip: Practice Daily",
          message: "Consistent daily practice improves retention by 40%. Try solving at least one question today!",
          type: "tip",
        });

        if (defaultNotifs.length > 0) {
          await supabase.from("notifications").insert(defaultNotifs);
          fetchNotifications();
        }
      }
    };
    generateDefaultNotifications();
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "streak": return <Flame className="w-4 h-4 text-warning" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case "tip": return <Info className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h4 className="text-sm font-semibold">Notifications</h4>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${
                      !n.is_read ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 block">{timeAgo(n.created_at)}</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!n.is_read && (
                        <button onClick={() => markAsRead(n.id)} className="p-1 hover:bg-muted rounded" title="Mark read">
                          <Check className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="p-1 hover:bg-muted rounded" title="Delete">
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
