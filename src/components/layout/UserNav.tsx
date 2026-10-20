"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
    LogOut,
    Settings2,
    ShieldCheck,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/features/auth/actions";
import { Role } from "@/types/domain";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserNavProps {
    user: {
        fullName: string;
        email: string;
        role: Role;
    };
}

export function UserNav({ user }: UserNavProps) {
    const [isPending, startTransition] = useTransition();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const getRoleVariant = (role: Role): "default" | "secondary" | "outline" | "destructive" => {
        switch (role) {
            case Role.SUPER_ADMIN:
                return "default";
            case Role.OFFICER:
                return "secondary";
            case Role.CITIZEN:
            default:
                return "outline";
        }
    };

    const initials = user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full"
                        aria-label={`Open ${user.fullName}'s account menu`}
                    />
                }
            >
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />    
                    <Avatar className="h-10 w-10 border border-border">
                    
                        <AvatarFallback className="font-semibold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="p-3 font-normal">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-10 border border-border">
                                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="truncate text-sm font-semibold leading-none">
                                    {user.fullName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant={getRoleVariant(user.role)}
                            className="mt-3 text-[10px] font-bold uppercase tracking-wider"
                        >
                            {user.role.replaceAll("_", " ")}
                        </Badge>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        render={<Link href="/accounts/profile" />}
                        className="cursor-pointer gap-2.5 px-2.5 py-2"
                    >
                        <UserRound className="text-muted-foreground" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        render={<Link href="/accounts/settings" />}
                        className="cursor-pointer gap-2.5 px-2.5 py-2"
                    >
                        <Settings2 className="text-muted-foreground" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled
                        className="gap-2.5 px-2.5 py-2 text-xs text-muted-foreground"
                    >
                        <ShieldCheck />
                        <span>Protected account</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer gap-2.5 px-2.5 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                    disabled={isPending}
                    onClick={() => setLogoutDialogOpen(true)}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            <Dialog
                open={logoutDialogOpen}
                onOpenChange={(open) => {
                    if (!isPending) setLogoutDialogOpen(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign out of your account?</DialogTitle>
                        <DialogDescription>
                            You can sign back in at any time. Any work you have not submitted will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setLogoutDialogOpen(false)}
                        >
                            Stay signed in
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => startTransition(() => logoutAction())}
                        >
                            {isPending ? "Signing out..." : "Sign out"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DropdownMenu>
    );
}
