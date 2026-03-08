import { Search, Bell, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TopBar() {
  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0">
      <SidebarTrigger className="mr-2" />

      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground">
          <Search className="w-4 h-4" />
          <span>Search questions, domains...</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
