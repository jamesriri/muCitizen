"use client";

import { ThemeToggle } from "@/components/shared";
import { UserNav } from "./UserNav";
import { MobileSidebar } from "./Sidebar";
import { Role } from "@/types";
import { Separator } from "@/components/ui";

interface HeaderProps {
  user: {
    fullName: string;
    email: string;
    role: Role;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur-sm px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <MobileSidebar userRole={user.role} />
      </div>

      <div className="flex items-center align-center justify-center gap-3">
        <ThemeToggle />
        <Separator orientation="vertical" className="h-6" />
        <UserNav user={user} />
      </div>
    </header>
  );
}
