import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Check,
    Droplets,
    FilePlus2,
    Landmark,
    MapPin,
    Search,
    Trash2,
    Trees,
    Wrench,
} from "lucide-react";
import { PublicSiteHeader, PublicSiteFooter } from "@/components/public";
import { Button } from "@/components/ui";
import { db } from "@/lib/db/prisma";

export const metadata = {
    title: "Your neighbourhood, heard",
    description: "Report local service issues, get a reference number, and follow progress from submission to resolution.",
};

const serviceIcons = [Wrench, Droplets, Trash2, Trees];

const steps = [
    {
        number: "01",
        title: "Tell us what's happening",
        description: "Choose a service, describe the issue, and add a location so the right team can find it.",
        icon: FilePlus2,
    },
    {
        number: "02",
        title: "Get your reference",
        description: "We'll give you a unique number to keep. Use it whenever you want to check in.",
        icon: MapPin,
    },
    {
        number: "03",
        title: "Follow the progress",
        description: "See status updates as your report moves through review and toward resolution.",
        icon: Check,
    },
];

export default function PublicLandingPage() {
    return (
        <div className="flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
            <PublicSiteHeader />

            <main className="flex-1">
                <section className="relative isolate overflow-hidden border-b border-border bg-[#f5f7f3] dark:bg-[#141b18]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-36 -top-32 size-112 rounded-full bg-emerald-500/10 blur-3xl sm:size-152"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-52 left-[18%] size-104 rounded-full bg-amber-400/10 blur-3xl"
                    />

                    <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:min-h-147.5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:py-24">
                        <div className="max-w-2xl">
                            <h1 className="mt-6 max-w-xl text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[4.4rem]">
                                Your neighbourhood.
                                <span className="mt-1 block text-emerald-800 dark:text-emerald-300">
                                    Your voice.
                                </span>
                            </h1>
                            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                                A broken streetlight or a leaking pipe shouldn&apos;t be hard to report — or
                                impossible to follow up. Tell us what needs attention, then keep
                                track of what happens next.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
                                <Button
                                    size="lg"
                                    className="h-12 justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-900 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200"
                                    nativeButton={false}
                                    render={<Link href="/requests" />}
                                >
                                    Report an issue <ArrowRight className="size-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-12 justify-center gap-2 rounded-xl border-foreground/15 bg-background/70 px-5 transition-colors hover:border-emerald-700/30 hover:bg-white dark:hover:bg-white/10"
                                    nativeButton={false}
                                    render={<Link href="/track" />}
                                >
                                    <Search className="size-4" /> Track a request
                                </Button>
                            </div>
                        </div>

                        <div className="relative mx-auto w-full max-w-127.5 lg:ml-auto">
                            <div className="absolute -left-3 top-12 hidden size-16 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-emerald-800 shadow-lg backdrop-blur sm:flex dark:border-white/10 dark:bg-[#202a25] dark:text-emerald-300">
                                <Landmark className="size-7" />
                            </div>
                            <div className="absolute -right-2 bottom-14 hidden size-14 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-amber-700 shadow-lg backdrop-blur sm:flex dark:border-white/10 dark:bg-[#202a25] dark:text-amber-300">
                                <MapPin className="size-6" />
                            </div>

                            <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-950/10 bg-white p-4 shadow-[0_24px_90px_-36px_rgba(13,55,39,0.3)] sm:p-6 dark:border-white/10 dark:bg-[#1b2420]">
                                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-300">
                                            <FilePlus2 className="size-5" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold">A report, step by step</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">From your street to the right team</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative py-5">
                                    <div className="absolute bottom-10 left-4.75 top-10 w-px bg-emerald-900/15 dark:bg-emerald-100/15" />
                                    {[
                                        { label: "You send a report", detail: "Issue and location", done: false },
                                        { label: "The team reviews it", detail: "Your report is routed", done: false },
                                        { label: "You see the outcome", detail: "Updates tied to your reference", done: false },
                                    ].map((step, index) => (
                                        <div key={step.label} className="relative flex items-center gap-4 py-3">
                                            <span
                                                className={`z-10 flex size-10 shrink-0 items-center justify-center rounded-full border ${step.done
                                                        ? "border-emerald-800 bg-emerald-800 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-emerald-950"
                                                        : "border-border bg-background text-muted-foreground"
                                                    }`}
                                            >
                                                {step.done ? <Check className="size-4" /> : <span className="text-xs font-semibold">0{index + 1}</span>}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold">{step.label}</p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-[#f5f7f3] p-3.5 dark:bg-white/5">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                            When you&apos;re ready
                                        </p>
                                        <p className="mt-1 text-xs font-medium">Start with a short report</p>
                                    </div>
                                    <ArrowDownRight className="size-5 text-emerald-800 dark:text-emerald-300" />
                                </div>
                                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                                    Clear updates. One reference to keep.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="services" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
                                    What needs attention?
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Start with the service that fits.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                                    Pick a category so your report reaches the right county team.
                                </p>
                            </div>
                            <Link
                                href="/requests"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition-[gap] hover:gap-3 dark:text-emerald-300"
                            >
                                See all services <ArrowUpRight className="size-4" />
                            </Link>
                        </div>

                        <Suspense fallback={<ServiceCategoriesFallback />}>
                            <ServiceCategoryCards />
                        </Suspense>
                    </div>
                </section>

                <section
                    id="how-it-works"
                    className="scroll-mt-20 border-y border-border bg-[#f5f7f3] py-16 dark:bg-[#141b18] sm:py-20 lg:py-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
                                No guesswork
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                From report to resolution, made visible.
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                                You’ll know where to start and how to check back in.
                            </p>
                        </div>
                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {steps.map((step) => {
                                const Icon = step.icon;
                                return (
                                    <article
                                        key={step.number}
                                        className="relative rounded-2xl border border-border bg-card p-5 sm:p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-300">
                                                <Icon className="size-5" />
                                            </span>
                                            <span className="font-mono text-xs text-muted-foreground">{step.number}</span>
                                        </div>
                                        <h3 className="mt-6 text-base font-semibold">{step.title}</h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="px-4 py-14 sm:px-6 sm:py-20 md:px-8">
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-emerald-950 px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14">
                        <div aria-hidden="true" className="absolute -right-16 -top-28 size-80 rounded-full border border-white/10" />
                        <div aria-hidden="true" className="absolute -right-2 -top-16 size-56 rounded-full border border-white/10" />
                        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="max-w-xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                                    Make the next step
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Something needs fixing? Let&apos;s get it on the record.
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                                    Submit a report or follow up on one you&apos;ve already sent.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 min-[420px]:flex-row sm:shrink-0">
                                <Button
                                    className="h-11 justify-center gap-2 rounded-xl bg-white px-4 font-semibold text-emerald-950 hover:bg-emerald-50"
                                    nativeButton={false}
                                    render={<Link href="/requests" />}
                                >
                                    Report an issue <ArrowRight className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-11 justify-center gap-2 rounded-xl border-white/25 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white"
                                    nativeButton={false}
                                    render={<Link href="/track" />}
                                >
                                    <Search className="size-4" /> Track a request
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <PublicSiteFooter />
        </div>
    );
}


async function ServiceCategoryCards() {
    await connection();
    const categories = await db.category.findMany({
        orderBy: { name: "asc" },
    });

    if (!categories.length) {
        return (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Service categories are being updated. You can still submit a report and
                choose the closest match.
            </div>
        );
    }

    return (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => {
                const Icon = serviceIcons[index % serviceIcons.length] ?? Wrench;
                return (
                    <Link
                        key={category.id}
                        href="/requests"
                        className="group flex min-h-44 flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-800/25 hover:shadow-lg hover:shadow-emerald-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 transition-colors group-hover:bg-emerald-800 group-hover:text-white dark:bg-emerald-300/10 dark:text-emerald-300 dark:group-hover:bg-emerald-300 dark:group-hover:text-emerald-950">
                            <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="mt-5 flex items-start justify-between gap-3">
                            <span className="min-w-0">
                                <span className="block text-sm font-semibold">{category.name}</span>
                                <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                                    {category.description}
                                </span>
                            </span>
                            <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-emerald-800 dark:group-hover:text-emerald-300" />
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}

function ServiceCategoriesFallback() {
    return (
        <div
            aria-label="Loading service categories"
            aria-busy="true"
            className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {Array.from({ length: 4 }, (_, index) => (
                <div
                    key={index}
                    className="min-h-44 animate-pulse rounded-2xl border border-border bg-muted/50"
                />
            ))}
        </div>
    );
}
