import { Suspense } from "react";
import { requireRole } from "@/lib/security";
import { Sidebar, Header } from "@/components/layout";
import { SidebarInset, SidebarProvider } from "@/components/ui";
import { Role } from "@/types";
import { CopilotDrawer } from "@/features/copilot/components";

function DashboardLoading() {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-background"
            role="status"
            aria-label="Loading dashboard"
        >
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                Loading your workspace…
            </div>
        </div>
    );
}

async function AuthenticatedDashboard({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await requireRole([
        Role.CITIZEN,
        Role.OFFICER,
        Role.SUPER_ADMIN,
    ]);

    return (
        <SidebarProvider>
            <Sidebar userRole={session.role} />

            <SidebarInset className="min-h-screen">
                <Header
                    user={{
                        fullName: session.fullName,
                        email: session.email,
                        role: session.role,
                    }}
                />
                <main className="w-full max-w-7xl flex-1 p-6 md:p-8 mx-auto">
                    <Suspense
                        fallback={
                            <div
                                className="min-h-64 animate-pulse rounded-2xl bg-muted/40"
                                role="status"
                                aria-label="Loading dashboard content"
                            />
                        }
                    >
                        {children}
                    </Suspense>
                </main>

                <CopilotDrawer userRole={session.role} />
            </SidebarInset>
        </SidebarProvider>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
        </Suspense>
    );
}
