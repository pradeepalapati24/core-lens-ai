import { Search, Bell, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TopBar() {
  return (
    <header className="h-12 border-b border-border bg-background flex items-center px-4 gap-4 shrink-0">
      <SidebarTrigger className="mr-1" />

      <div className="flex-1 max-w-sm">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 text-sm text-muted-foreground">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search questions, domains...</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary" />
        </div>
      </div>
    </header>
  );
}
