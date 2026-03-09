import { useState, useEffect } from "react";
import { Cpu, LayoutDashboard, User, BookOpen, Layers, Swords, FileText, LogOut, ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Practice", url: "/practice", icon: BookOpen },
  { title: "Domains", url: "/domains", icon: Layers },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Challenge", url: "/challenge", icon: Swords },
  { title: "Skill Report", url: "/skill-report", icon: FileText },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [displayName, setDisplayName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("id", user.id)
          .single();
        setDisplayName(profile?.display_name || profile?.username || user.email?.split("@")[0] || "");
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 pb-3">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0 shadow-sm">
            <Cpu className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white">CoreLens</span>
              <span className="text-[10px] text-white/40 -mt-0.5">AI Interview Coach</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-white/25 px-3 mb-1">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => {
                const active = currentPath === item.url || (item.url === "/practice" && (currentPath === "/workspace" || currentPath === "/interview"));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                          active
                            ? "bg-sidebar-primary text-white font-medium shadow-sm"
                            : "text-white/90 hover:text-white hover:bg-white/10"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-[15px] w-[15px] shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <NavLink
          to="/profile"
          className={`flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150 ${
            currentPath === "/profile"
              ? "!bg-sidebar-primary !text-white"
              : "!text-white/70 hover:!text-white hover:!bg-white/10"
          }`}
          activeClassName=""
        >
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{displayName || "Profile"}</div>
              <div className="text-[10px] text-white/40 truncate">{userEmail}</div>
            </div>
          )}
        </NavLink>

        {!collapsed && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg !text-white/35 hover:!text-red-400 hover:!bg-red-500/10 transition-all duration-150 w-full text-[12px]"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Sign out</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
