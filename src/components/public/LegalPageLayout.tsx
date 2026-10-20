import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import PublicSiteFooter  from "./PublicSiteFooter";
import PublicSiteHeader from "./PublicSiteHeader";

export interface LegalSection {
  title: string;
  icon: LucideIcon;
  content: ReactNode;
}

export default function LegalPageLayout({
  eyebrow,
  title,
  description,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicSiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-muted/35">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
            <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem] md:items-end">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {description}
                </p>
              </div>
              <p className="text-xs text-muted-foreground md:text-right">
                Last updated <span className="mt-1 block text-sm font-medium text-foreground">{updated}</span>
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 md:px-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-16">
          <aside className="h-fit min-w-0 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              On this page
            </p>
            <nav aria-label="Page contents" className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {sections.map((section, index) => (
                <Link
                  key={section.title}
                  href={`#section-${index + 1}`}
                  className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:text-sm"
                >
                  <span className="font-mono text-[10px] text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 divide-y divide-border">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.title}
                  id={`section-${index + 1}`}
                  className="scroll-mt-28 py-8 first:pt-0 last:pb-0 sm:py-10"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-xs">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[11px] text-muted-foreground">
                        SECTION {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                        {section.title}
                      </h2>
                      <div className="prose-legal mt-4 space-y-4 text-sm leading-7 text-muted-foreground">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
            <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.035] p-5 sm:p-6">
              <p className="text-sm font-semibold">Need help with a request?</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Sign in to submit a report, or check progress with your reference number.
              </p>
              <Link
                href="/track"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-[gap] hover:gap-3"
              >
                Track a request <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <PublicSiteFooter />
    </div>
  );
}
