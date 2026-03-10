import { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NotificationDropdown from "@/components/NotificationDropdown";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/practice": "Practice",
  "/domains": "Domains",
  "/workspace": "Workspace",
  "/interview": "Interview Simulation",
  "/evaluation": "Evaluation",
  "/challenge": "Challenge",
  "/skill-report": "Skill Report",
  "/profile": "Profile",
};

export default function TopBar() {
  const location = useLocation();
  const currentLabel = routeLabels[location.pathname] || "CoreLens";
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", user.id)
          .single();
        setDisplayName(profile?.display_name || profile?.username || "");
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0 sticky top-0 z-20">
      <SidebarTrigger className="mr-1 text-muted-foreground hover:text-foreground" />
      
      {/* Page title */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{currentLabel}</h2>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm ml-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-transparent hover:border-border transition-colors text-sm text-muted-foreground cursor-pointer group">
          <Search className="w-3.5 h-3.5 opacity-50 group-hover:opacity-70" />
          <span className="text-xs flex-1">Search questions, domains...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-background border border-border font-mono text-muted-foreground">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
        
        {displayName && (
          <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <span className="text-xs text-muted-foreground">Hey, <span className="font-medium text-foreground">{displayName.split(" ")[0]}</span></span>
          </div>
        )}
      </div>
    </header>
  );
}
