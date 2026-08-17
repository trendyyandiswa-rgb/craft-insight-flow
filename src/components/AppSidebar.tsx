import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  ListChecks,
  CalendarDays,
  CalendarRange,
  Calendar,
  Search,
  Inbox,
  BookMarked,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppState } from "@/lib/store";

const groups = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Smart Email", url: "/email", icon: Mail },
      { title: "My Tasks", url: "/tasks", icon: ListChecks },
      { title: "AI Research", url: "/research", icon: Search },
    ],
  },
  {
    label: "Plan",
    items: [
      { title: "Daily Planner", url: "/planner", icon: CalendarDays },
      { title: "Weekly Planner", url: "/weekly", icon: CalendarRange },
      { title: "Calendar", url: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Library",
    items: [
      { title: "Saved Emails", url: "/saved-emails", icon: Inbox },
      { title: "Saved Research", url: "/saved-research", icon: BookMarked },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Settings", url: "/settings", icon: SettingsIcon },
    ],
  },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const name = useAppState((s) => s.settings.name);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-hero text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold">Aura Assistant</span>
              <span className="block truncate text-[11px] text-sidebar-foreground/60">
                Write · Plan · Research
              </span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
              <Link to="/settings" className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sidebar-primary text-[11px] font-bold text-sidebar-primary-foreground">
                  {(name?.[0] ?? "A").toUpperCase()}
                </span>
                <span className="truncate">{name || "Your profile"}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Log out">
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
