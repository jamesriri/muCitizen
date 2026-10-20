import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { getSession } from "@/lib/security/session";
import { Role } from "@/types/domain";

function csvValue(value: string | null | undefined): string {
  const safeValue = value ?? "";
  const formulaSafeValue = /^[\t\r ]*[=+\-@]/.test(safeValue)
    ? `'${safeValue}`
    : safeValue;
  return `"${formulaSafeValue.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  if (session.role !== Role.CITIZEN) {
    return new NextResponse("Citizen account required.", { status: 403 });
  }

  const requests = await db.serviceRequest.findMany({
    where: { citizenId: session.userId },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  const rows = [
    [
      "Reference",
      "Title",
      "Category",
      "Status",
      "Priority",
      "Location",
      "Reported",
      "SLA Due",
      "Resolved",
    ].map(csvValue),
    ...requests.map((request) =>
      [
        request.referenceNumber,
        request.title,
        request.category.name,
        request.status,
        request.priority,
        request.locationAddress,
        request.createdAt.toISOString(),
        request.slaDueDate.toISOString(),
        request.resolvedAt?.toISOString() ?? "",
      ].map(csvValue),
    ),
  ];
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(rows.map((row) => row.join(",")).join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="my-service-requests-${date}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
