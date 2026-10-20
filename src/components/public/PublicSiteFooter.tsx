import Link from "next/link";
import { Landmark } from "lucide-react";

export default function PublicSiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-14">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Landmark className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold">muCitizen</span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            A simpler way to report local service issues and follow what happens next.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Get help
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="transition-colors hover:text-primary" href="/track">Track a request</Link></li>
            <li><Link className="transition-colors hover:text-primary" href="/login">Sign in or register</Link></li>
            <li><Link className="transition-colors hover:text-primary" href="/#how-it-works">How it works</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Information
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link className="transition-colors hover:text-primary" href="/terms">Terms of service</Link></li>
            <li><Link className="transition-colors hover:text-primary" href="/privacy">Privacy policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between md:px-8">
          <span>© 2026 muCitizen · All rights reserved.</span>
          <span>Local services, made easier to follow.</span>
        </div>
      </div>
    </footer>
  );
}
