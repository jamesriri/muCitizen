"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { IncidentPin } from "./IncidentMapInner";

const IncidentMapDynamic = dynamic(
    () => import("./IncidentMapInner"),
    {
        ssr: false,
        loading: () => (
            <div className="h-[calc(100vh-12rem)] w-full rounded-2xl border border-border bg-muted/20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-semibold text-muted-foreground">
                    Loading Geospatial Incident Engine...
                </p>
            </div>
        ),
    }
);

export default function IncidentMap({ incidents }: { incidents: IncidentPin[] }) {
    return <IncidentMapDynamic incidents={incidents} />;
}
