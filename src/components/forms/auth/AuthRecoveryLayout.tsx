import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

export default function AuthRecoveryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-muted/20 px-4 py-10 sm:px-6 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 size-96 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-24 size-96 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-center">
        <section className="hidden space-y-8 lg:block">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex h-12 w-12 bg-primary rounded-2xl my-6 items-center justify-center text-primary-foreground font-black text-xl shadow-lg">
              <Landmark className="h-6 w-6" />
            </div>
          </Link>
          <div className="max-w-lg space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Account recovery
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              A secure way back into your account.
            </h1>
            <p className="max-w-md text-base leading-7 text-muted-foreground">
              We will share the instructions to get back into your county services account
              and continue using our services.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <Landmark className="size-4 text-primary" />
            muCitizen
          </Link>
          {children}
          <Link
            href="/login"
            className="mx-auto mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Return to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}
