"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  LockKeyhole,
  PanelLeft,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import { getNavigationForRole, type NavItem } from "@/lib/config";
import { Role } from "@/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui";

interface SidebarProps {
  userRole: Role;
}

const navigationSections: {
  label: string;
  items: (item: NavItem) => boolean;
}[] = [
  {
    label: "Your services",
    items: (item) =>
      ["/requests", "/my-requests", "/my-analytics"].includes(item.href),
  },
  {
    label: "Public access",
    items: (item) => item.href === "/track",
  },
  {
    label: "Operations",
    items: (item) => ["/incidents", "/map", "/analytics"].includes(item.href),
  },
  {
    label: "Administration",
    items: (item) =>
      item.href === "/staff" || item.href === "/audit",
  },
];

function SidebarNavigation({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const allowedItems = getNavigationForRole(userRole);

  return (
    <SidebarContent className="px-3 py-4">
      {navigationSections.map((section) => {
        const items = allowedItems.filter(section.items);
        if (items.length === 0) return null;

        return (
          <SidebarGroup key={section.label} className="p-0 [&+&]:mt-5">
            <SidebarGroupLabel className="h-7 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/45">
              {section.label}
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/analytics" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-10 rounded-lg px-3 text-[13px] font-medium text-sidebar-foreground/70 transition-all hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-foreground data-active:bg-sidebar-accent data-active:text-sidebar-foreground data-active:shadow-sm [&_svg]:size-4.25 [&_svg]:text-sidebar-foreground/55 data-active:[&_svg]:text-sidebar-primary"
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="right-2 rounded-md border border-sidebar-border bg-sidebar px-1.5 text-[10px] font-semibold text-sidebar-foreground/65">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </SidebarContent>
  );
}

export default function AppSidebar({ userRole }: SidebarProps) {
  const roleLabel = {
    [Role.CITIZEN]: "Citizen workspace",
    [Role.OFFICER]: "Officer workspace",
    [Role.SUPER_ADMIN]: "Administrator workspace",
  }[userRole];

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="px-4 pb-3 pt-5 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-sidebar-primary/20 group-data-[collapsible=icon]:hidden">
            <Landmark className="size-4.75" strokeWidth={1.8} />
            <span className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-sidebar bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
              muCitizen
            </p>
            <p className="mt-0.5 truncate text-[11px] text-sidebar-foreground/50">
              {roleLabel}
            </p>
          </div>
          <SidebarTrigger
            aria-label="Toggle navigation width"
            className="ml-auto size-8 shrink-0 rounded-lg text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-9"
          >
            <PanelLeft className="size-4 group-data-[collapsible=icon]:hidden" />
            <PanelLeftOpen className="hidden size-4 group-data-[collapsible=icon]:block" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <div className="w-full px-4">
        <SidebarSeparator className="mx-0 w-full max-w-full opacity-70" />
      </div>
      <SidebarNavigation userRole={userRole} />
      <div className="w-full px-4">
        <SidebarSeparator className="mx-0 w-full max-w-full opacity-70" />
      </div>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-semibold text-sidebar-foreground">
              Secure connection
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-sidebar-foreground/50">
              <LockKeyhole className="size-3" />
              Protected public services
            </p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function MobileSidebar({ userRole }: SidebarProps) {
  return (
    <SidebarTrigger
      aria-label={`Open ${userRole.toLowerCase().replace("_", " ")} navigation`}
      className="size-9 rounded-lg border border-border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground md:hidden"
    >
      <PanelLeft className="size-4" />
    </SidebarTrigger>
  );
}
