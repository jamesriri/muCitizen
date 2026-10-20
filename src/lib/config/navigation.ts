import {
  PlusCircle,
  FileText,
  Search,
  BarChart3,
  Users,
  ShieldAlert,
  CheckSquare,
  LucideIcon,
  MapPin,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";
import { Role } from "@/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles: Role[];
}

export const DASHBOARD_NAVIGATION: NavItem[] = [
  // Citizen Section
  {
    title: "Report New Issue",
    href: "/requests",
    icon: PlusCircle,
    roles: [Role.CITIZEN],
  },
  {
    title: "My Service Requests",
    href: "/my-requests",
    icon: FileText,
    roles: [Role.CITIZEN],
  },
  {
    title: "My Activity",
    href: "/my-analytics",
    icon: ChartNoAxesColumnIncreasing,
    roles: [Role.CITIZEN],
  },
  {
    title: "Public Ticket Tracker",
    href: "/track",
    icon: Search,
    roles: [Role.CITIZEN, Role.OFFICER, Role.SUPER_ADMIN],
  },

  // Officer / Dispatch Section
  {
    title: "Incident Queue",
    href: "/incidents",
    icon: CheckSquare,
    roles: [Role.OFFICER, Role.SUPER_ADMIN],
  },
  {
    title: "Geospatial Map", 
    href: "/map",
    icon: MapPin,
    roles: [Role.OFFICER, Role.SUPER_ADMIN],
  },
  {
    title: "Command Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: [Role.OFFICER, Role.SUPER_ADMIN],
  },

  // Super Admin Only Section
  {
    title: "Staff & Officers",
    href: "/staff",
    icon: Users,
    roles: [Role.SUPER_ADMIN],
  },
  {
    title: "System Audit Logs",
    href: "/audit",
    icon: ShieldAlert,
    roles: [Role.SUPER_ADMIN],
  },
];

export function getDashboardPath(role: Role): string {
  return role === Role.CITIZEN ? "/my-requests" : "/analytics";
}

export function getNavigationForRole(role: Role): NavItem[] {
  return DASHBOARD_NAVIGATION.filter((item) => item.roles.includes(role));
}
