import { db } from "@/lib/db/prisma";
import { RequestStatus, Role } from "@/types/domain";

export class AdminRequestService {
  /**
   * Retrieves all requests with category, citizen, officer, attachments, and audit logs
   */
  static async getAllRequests() {
    return db.serviceRequest.findMany({
      include: {
        category: true,
        citizen: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            nationalId: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        attachments: true,
        auditLogs: {
          include: {
            actor: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Retrieves all staff eligible for incident assignment
   */
  static async getEligibleOfficers() {
    return db.user.findMany({
      where: {
        role: { in: [Role.OFFICER, Role.SUPER_ADMIN] },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
      orderBy: { fullName: "asc" },
    });
  }

  /**
   * Transitions request status, writes an audit record, and updates resolution timestamp
   */
  static async updateStatus(params: {
    requestId: string;
    newStatus: RequestStatus;
    comment: string;
    actorId: string;
    isInternal?: boolean;
  }) {
    const existing = await db.serviceRequest.findUniqueOrThrow({
      where: { id: params.requestId },
    });

    const isNowResolved = params.newStatus === RequestStatus.RESOLVED;

    return db.serviceRequest.update({
      where: { id: params.requestId },
      data: {
        status: params.newStatus,
        resolvedAt: isNowResolved ? new Date() : existing.resolvedAt,
        auditLogs: {
          create: {
            actorId: params.actorId,
            action: "STATUS_CHANGE",
            fromStatus: existing.status,
            toStatus: params.newStatus,
            comment:
              params.comment.trim() || `Status updated to ${params.newStatus}`,
            isInternal: params.isInternal ?? false,
          },
        },
      },
    });
  }

  /**
   * Assigns an incident to a designated officer and creates an audit record
   */
  static async assignOfficer(params: {
    requestId: string;
    officerId: string;
    actorId: string;
  }) {
    const officer = await db.user.findUniqueOrThrow({
      where: { id: params.officerId },
    });

    return db.serviceRequest.update({
      where: { id: params.requestId },
      data: {
        assignedToId: officer.id,
        status: RequestStatus.IN_PROGRESS,
        auditLogs: {
          create: {
            actorId: params.actorId,
            action: "OFFICER_ASSIGNED",
            comment: `Assigned incident dispatch to ${officer.fullName} (${officer.role})`,
            isInternal: true,
          },
        },
      },
    });
  }

  /**
   * Compiles all service requests into standard CSV data for export
   */
  static async generateCsvData(): Promise<string> {
    const records = await this.getAllRequests();

    const headers = [
      "Reference Number",
      "Title",
      "Category",
      "Status",
      "Priority",
      "Citizen Name",
      "Citizen Email",
      "Citizen Phone",
      "Location Address",
      "Assigned Officer",
      "Date Reported",
      "SLA Due Date",
      "Date Resolved",
    ];

    const escapeCsv = (val: string | null | undefined) => {
      const safeValue = val ?? "";
      const formulaSafeValue = /^[\t\r ]*[=+\-@]/.test(safeValue)
        ? `'${safeValue}`
        : safeValue;
      return `"${formulaSafeValue.replace(/"/g, '""')}"`;
    };

    const rows = records.map((r) => [
      escapeCsv(r.referenceNumber),
      escapeCsv(r.title),
      escapeCsv(r.category.name),
      escapeCsv(r.status),
      escapeCsv(r.priority),
      escapeCsv(r.citizen.fullName),
      escapeCsv(r.citizen.email),
      escapeCsv(r.citizen.phoneNumber),
      escapeCsv(r.locationAddress),
      escapeCsv(r.assignedTo?.fullName || "Unassigned"),
      escapeCsv(r.createdAt.toISOString()),
      escapeCsv(r.slaDueDate.toISOString()),
      escapeCsv(r.resolvedAt ? r.resolvedAt.toISOString() : "Unresolved"),
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }
}
