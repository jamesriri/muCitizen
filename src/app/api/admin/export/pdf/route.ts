import { NextResponse } from "next/server";
import { AdminRequestService } from "@/features/admin/services/admin-request.service";
import { generatePdfReport } from "@/features/requests/export/pdf-report";
import { getSession } from "@/lib/security";
import { Role } from "@/types/domain";

export async function GET(request: Request) {
  const isPreview = new URL(request.url).searchParams.get("preview") === "1";
  const session = await getSession();
  if (!session || (session.role !== Role.SUPER_ADMIN && session.role !== Role.OFFICER)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const requests = await AdminRequestService.getAllRequests();
  const formatDate = (date: Date) =>
    `${new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Africa/Nairobi",
    }).format(date)} EAT`;
  const generatedAt = formatDate(new Date());
  const sections = requests.map((request) => ({
    heading: `${request.referenceNumber}  -  ${request.title.slice(0, 110)}`,
    entries: [
      { label: "Category", value: request.category.name },
      { label: "Status / priority", value: `${request.status} / ${request.priority}` },
      { label: "Location", value: request.locationAddress },
      { label: "Citizen", value: request.citizen.fullName },
      { label: "Assigned officer", value: request.assignedTo?.fullName ?? "Unassigned" },
      { label: "Reported", value: formatDate(request.createdAt) },
      { label: "SLA due", value: formatDate(request.slaDueDate) },
    ],
  }));
  const date = new Date().toISOString().slice(0, 10);
  const pdf = await generatePdfReport(
    "County Incident Report",
    `Generated ${generatedAt}  |  ${requests.length} service requests`,
    sections,
  );

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="mucitizen-incidents-${date}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
