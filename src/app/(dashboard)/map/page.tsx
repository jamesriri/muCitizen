import { db } from "@/lib/db/prisma";
import { IncidentMap } from "@/features/map/components";
import { requireRole } from "@/lib/security";
import { Role } from "@/types/domain";

export const metadata = {
    title: "County Incident Map | muCitizen",
    description: "Map of reported county service issues across Kenya",
};

export default async function AdminMapPage() {
    await requireRole([Role.OFFICER, Role.SUPER_ADMIN]);
    const incidents = await db.serviceRequest.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null },
        },
        include: {
            category: true,
            citizen: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
            assignedTo: {
                select: {
                    id: true,
                    fullName: true,
                    role: true,
                },
            },
            attachments: true,
            auditLogs: {
                include: {
                    actor: true,
                },
                orderBy: { createdAt: "desc" },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Geospatial Dispatch Center</h2>
                    <p className="text-sm text-muted-foreground">
                        Map view of hazards, water issues, uncollected waste, and other county service reports.
                    </p>
                </div>
            </div>

            <IncidentMap incidents={incidents} />
        </div>
    );
}
