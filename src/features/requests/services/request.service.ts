import { db } from "@/lib/db/prisma";
import { generateReferenceCode } from "@/lib/utils";
import { NeonStorageService } from "@/lib/storage";
import { RequestStatus, Priority } from "@/types/domain";
import { CreateRequestInput } from "../schemas/request.schema";

export class RequestService {
  /**
   * Retrieves all active county service categories and response targets
   */
  static async getCategories() {
    return db.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Creates a service request, computes SLA deadline, uploads image, and records audit trail
   */
  static async createRequest(
    input: CreateRequestInput,
    citizenId: string,
    file?: File | null
  ) {
    const category = await db.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new Error("Selected incident category does not exist.");
    }

    // Compute SLA Target Resolution Date: Current Time + SLA Hours
    const now = new Date();
    const slaDueDate = new Date(now.getTime() + category.slaHours * 60 * 60 * 1000);
    const referenceNumber = generateReferenceCode();

    let attachmentData = undefined;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const publicUrl = await NeonStorageService.uploadAttachment(file.name, buffer, file.type);

      attachmentData = {
        create: [
          {
            fileUrl: publicUrl,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          },
        ],
      };
    }

    //Persist Service Request and initial Audit Log entry atomically
    return db.serviceRequest.create({
      data: {
        referenceNumber,
        title: input.title,
        description: input.description,
        status: RequestStatus.PENDING,
        priority: input.priority || Priority.MEDIUM,
        locationAddress: input.locationAddress,
        latitude: input.latitude,
        longitude: input.longitude,
        slaDueDate,
        categoryId: category.id,
        citizenId,
        attachments: attachmentData,
        auditLogs: {
          create: [
            {
              actorId: citizenId,
              action: "CREATED",
              toStatus: RequestStatus.PENDING,
              comment: "Incident reported by citizen via online portal.",
              isInternal: false,
            },
          ],
        },
      },
      include: {
        category: true,
        attachments: true,
      },
    });
  }

  /**
   * Public Ticket Tracker lookup: unauthenticated access to non-sensitive incident progress
   */
  static async getPublicTicketByReference(referenceNumber: string) {
    const request = await db.serviceRequest.findUnique({
      where: { referenceNumber: referenceNumber.trim().toUpperCase() },
      include: {
        category: true,
        attachments: true,
        auditLogs: {
          where: { isInternal: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!request) return null;

    // For privacy purposes, return non-sensitive fields to the public
    return {
      referenceNumber: request.referenceNumber,
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      locationAddress: request.locationAddress,
      slaDueDate: request.slaDueDate,
      createdAt: request.createdAt,
      resolvedAt: request.resolvedAt,
      category: {
        name: request.category.name,
        slaHours: request.category.slaHours,
        iconName: request.category.iconName,
      },
      attachments: request.attachments.map((a) => ({
        id: a.id,
        fileUrl: a.fileUrl,
        fileName: a.fileName,
      })),
      timeline: request.auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        fromStatus: log.fromStatus,
        toStatus: log.toStatus,
        comment: log.comment,
        createdAt: log.createdAt,
      })),
    };
  }
}
