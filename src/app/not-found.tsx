import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary),transparent_55%)] opacity-10"
      />
      <section className="relative w-full max-w-xl text-center">
        <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The address may be outdated, or the page may have moved. Head back to
          your workspace or look up a public service request.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button nativeButton={false} render={<Link href="/" />}>
            <ArrowLeft className="size-4" />
            Return to the portal
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/track" />}
          >
            <Search className="size-4" />
            Track a request
          </Button>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          muCitizen · Local services, made easier to follow.
        </p>        
      </section>
    </main>
  );
}
