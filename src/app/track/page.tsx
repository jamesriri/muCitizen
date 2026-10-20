import { Suspense } from "react";
import Link from "next/link";
import { RequestService } from "@/features/requests/services/request.service";
import { Search, AlertTriangle, Landmark } from "lucide-react";
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";
import { getSession } from "@/lib/security";
import { UserNav } from "@/components/layout/UserNav";

export const metadata = {
  title: "Track a Report | muCitizen",
  description: "Track public service request resolution without logging in",
};

interface PublicTrackPageProps {
  searchParams: Promise<{ code?: string }>;
}

async function PublicTrackContent({ searchParams }: PublicTrackPageProps) {
  const { code } = await searchParams;
  const session = await getSession();
  const ticket = code ? await RequestService.getPublicTicketByReference(code) : null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-between">
      {/* Public Top Navbar */}
      <header className="border-b bg-background/95 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Landmark className="h-4 w-4" />
            </div>
            <span>muCitizen Report Tracker</span>
          </Link>
          {session ? (
            <UserNav
              user={{
                fullName: session.fullName,
                email: session.email,
                role: session.role,
              }}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<Link href="/" />}
            >
              <span>Sign in</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Tracker Container */}
      <main className="max-w-3xl mx-auto w-full p-4 md:p-8 flex-1">
        {/* Search Bar Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Public Service Request Tracker</CardTitle>
            <CardDescription>
              Enter your reference number (e.g. SR-202610-8A190) to check the latest update.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="GET" action="/track" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="code"
                  defaultValue={code || ""}
                  placeholder="Enter reference code (e.g. SR-202610-8A190)"
                  className="pl-9 font-mono uppercase"
                  required
                />
              </div>
              <Button type="submit">Track Status</Button>
            </form>
          </CardContent>
        </Card>

        {/* Search Results Display */}
        {code && !ticket && (
          <Card className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <p className="font-semibold text-foreground">Reference code not found</p>
            <p className="text-xs mt-1">Please verify the format (SR-YYYYMM-XXXXX) and try again.</p>
          </Card>
        )}

        {ticket && (
          <Card className="border-primary/30 shadow-md">
            <CardHeader className="border-b pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-bold text-primary">
                  {ticket.referenceNumber}
                </span>
                <Badge
                  variant={
                    ticket.status === "RESOLVED"
                      ? "default"
                      : ticket.status === "IN_PROGRESS"
                      ? "secondary"
                      : "outline"
                  }
                  className="font-semibold capitalize text-xs"
                >
                  {ticket.status.toLowerCase().replace("_", " ")}
                </Badge>
              </div>
              <CardTitle className="text-xl pt-2">{ticket.title}</CardTitle>
              <CardDescription>{ticket.locationAddress}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Citizen Description
                </p>
                <p className="text-sm text-foreground leading-relaxed">{ticket.description}</p>
              </div>

              {/* Official Audit Timeline */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Official Progress Timeline
                </p>
                <div className="border-l-2 border-primary/30 pl-4 space-y-4">
                  {ticket.timeline.map((item) => (
                    <div key={item.id} className="relative space-y-1 text-xs">
                      <div className="absolute -left-5.25 top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{item.action}</span>
                        <span className="text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {item.comment && (
                        <p className="text-muted-foreground text-[11px]">{item.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 Republic Public Service Portal • Official Transparency Channel
      </footer>
    </div>
  );
}

export default function PublicTrackPage({
  searchParams,
}: PublicTrackPageProps) {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-muted/20 text-sm text-muted-foreground"
          role="status"
        >
          Loading the public tracker…
        </div>
      }
    >
      <PublicTrackContent searchParams={searchParams} />
    </Suspense>
  );
}
