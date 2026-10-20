import { NextResponse } from "next/server";
import { getSession } from "@/lib/security";
import { Role } from "@/types";
import { AdminRequestService } from "@/features/admin/services/admin-request.service";

export async function GET() {
  const session = await getSession();

  if (!session || (session.role !== Role.SUPER_ADMIN && session.role !== Role.OFFICER)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const csvContent = await AdminRequestService.generateCsvData();
  const filename = `mucitizen-dispatches-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
