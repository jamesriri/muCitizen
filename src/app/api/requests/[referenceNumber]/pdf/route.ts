import { NextResponse } from "next/server";
import { generatePdfReport } from "@/features/requests/export/pdf-report";
import { db } from "@/lib/db/prisma";
import { getSession } from "@/lib/security/session";
import { Role } from "@/types/domain";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ referenceNumber: string }> },
) {
  const isPreview = new URL(request.url).searchParams.get("preview") === "1";
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  if (session.role !== Role.CITIZEN) {
    return new NextResponse("Only citizens can download personal receipts.", {
      status: 403,
    });
  }

  const { referenceNumber } = await params;
  const record = await db.serviceRequest.findUnique({
    where: { referenceNumber: referenceNumber.trim().toUpperCase() },
    include: { category: true },
  });
  if (!record || record.citizenId !== session.userId) {
    return new NextResponse("Request not found.", { status: 404 });
  }

  const shareUrl = new URL(
    `/track?code=${encodeURIComponent(record.referenceNumber)}`,
    request.url,
  ).toString();
  const formatDate = (date: Date) =>
    `${new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Nairobi",
    }).format(date)} EAT`;
  const generatedAt = formatDate(new Date());
  const pdf = await generatePdfReport(
    "County Service Report",
    `Reference ${record.referenceNumber}  |  Generated ${generatedAt}`,
    [
      {
        heading: record.title.slice(0, 140),
        entries: [
          { label: "Reference", value: record.referenceNumber },
          { label: "Status", value: record.status.replaceAll("_", " ") },
          { label: "Priority", value: record.priority },
          { label: "Category", value: record.category.name },
          { label: "Reported by", value: session.fullName },
          { label: "Location", value: record.locationAddress },
          { label: "Description", value: record.description },
          { label: "Submitted", value: formatDate(record.createdAt) },
          { label: "Service target", value: formatDate(record.slaDueDate) },
          {
            label: "Resolved",
            value: record.resolvedAt
              ? formatDate(record.resolvedAt)
              : "Not yet resolved",
          },
          { label: "Public status link", value: shareUrl },
        ],
      },
    ],
  );

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="mucitizen-record-${record.referenceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
