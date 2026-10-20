import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Landmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/UserNav";
import { getSession } from "@/lib/security/session";
import { getDashboardPath } from "@/lib/config/navigation";

function PublicSiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-bold tracking-tight">muCitizen</span>
        </Link>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    </header>
  );
}

async function PublicSiteHeaderContent() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-3">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight">
              muCitizen
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Local services, made easier to follow.
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          <Link
            href="/#services"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Services
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <Link
            href="/track"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Track a request
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 sm:hidden"
            nativeButton={false}
            render={<Link href="/track" aria-label="Track a request" />}
          >
            <Search className="size-4" />
            <span className="sr-only">Track</span>
          </Button>
          {session ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
                nativeButton={false}
                render={<Link href={getDashboardPath(session.role)} />}
              >
                My workspace <ArrowUpRight className="size-3.5" />
              </Button>
              <UserNav
                user={{
                  fullName: session.fullName,
                  email: session.email,
                  role: session.role,
                }}
              />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>
              <Button
                size="sm"
                className="px-3 sm:px-4"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                <span className="sm:hidden">Get started</span>
                <span className="hidden sm:inline">Create an account</span>
                <ArrowUpRight className="ml-1 size-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function PublicSiteHeader() {
  return (
    <Suspense fallback={<PublicSiteHeaderFallback />}>
      <PublicSiteHeaderContent />
    </Suspense>
  );
}
