import { db } from "@/lib/db/prisma";
import { Role, RequestStatus, Priority } from "@/types/domain";

export class CopilotService {
  /**
   * Grounds responses in real-time database state
   */
  static async generateCivicResponse(message: string, role: Role): Promise<string> {
    const normalized = message.toLowerCase().trim();

    // Ticket Tracking Detection
    const refMatch = message.match(/SR-\d{6}-[A-Z0-9]{5}/i);
    if (refMatch) {
      const code = refMatch[0].toUpperCase();
      const ticket = await db.serviceRequest.findUnique({
        where: { referenceNumber: code },
        include: { category: true, assignedTo: true },
      });

      if (!ticket) {
        return `I checked the county records, but I could not find a service request with reference number **${code}**. Please check the number on your submission receipt.`;
      }

      const assignedInfo = ticket.assignedTo
        ? `assigned to **${ticket.assignedTo.fullName}**`
        : "currently pending officer assignment";

      return `**Ticket Lookup (${ticket.referenceNumber})**:\n\n` +
        `• **Title:** ${ticket.title}\n` +
        `• **Category:** ${ticket.category.name}\n` +
        `• **Status:** ${ticket.status.replace("_", " ")}\n` +
        `• **Dispatch State:** ${assignedInfo}\n` +
        `• **Statutory Deadline:** ${new Date(ticket.slaDueDate).toLocaleDateString()}\n` +
        `• **Location:** ${ticket.locationAddress}\n\n` +
        (ticket.status === RequestStatus.RESOLVED
          ? "This issue has been resolved and checked by the county team."
          : "Field teams are working toward the resolution window.");
    }

    // Category Inquiries (Streetlight, Water, Garbage, Roads)
    if (normalized.includes("sla") || normalized.includes("how long") || normalized.includes("deadline")) {
      const categories = await db.category.findMany();
      const summaryList = categories
        .map((c) => `• **${c.name}**: ${c.slaHours} hours SLA target`)
        .join("\n");

      return `Each county service category has a target response time:\n\n${summaryList}\n\nIf a report passes its target, it is flagged for follow-up.`;
    }

    // Briefings
    if (role === Role.OFFICER || role === Role.SUPER_ADMIN) {
      if (normalized.includes("summary") || normalized.includes("urgent") || normalized.includes("bottleneck") || normalized.includes("status")) {
        const [total, pending, urgent, resolved] = await Promise.all([
          db.serviceRequest.count(),
          db.serviceRequest.count({ where: { status: RequestStatus.PENDING } }),
          db.serviceRequest.count({
            where: {
              priority: Priority.URGENT,
              status: { not: RequestStatus.RESOLVED },
            },
          }),
          db.serviceRequest.count({ where: { status: RequestStatus.RESOLVED } }),
        ]);

        return `**Officer Operational Briefing**:\n\n` +
          `• **Total Recorded Intake:** ${total} incidents\n` +
          `• **Awaiting Triage:** ${pending} cases require review\n` +
          `• **Critical Attention:** ${urgent} URGENT hazards currently open\n` +
          `• **Resolved:** ${resolved} successfully closed\n\n` +
          `*Recommendation: Access the Incident Queue or Geospatial Map to prioritize urgent dispatches.*`;
      }
    }

    // Reporting Guidance
    if (normalized.includes("how to report") || normalized.includes("submit") || normalized.includes("new request")) {
      return `To submit a civic service request:\n\n` +
        `1. Navigate to **"Report New Issue"** in the sidebar.\n` +
        `2. Select the matching incident category (e.g. Broken Streetlight, Water & Drainage).\n` +
        `3. Provide a title, physical landmark address, or click **"Pin Current GPS Coordinates"**.\n` +
        `4. (Optional) Upload an on-site photo to assist field technicians.\n\n` +
        `Once submitted, you will receive an official **SR reference number** to track the resolution timeline.`;
    }

    // efault Contextual Fallback
    return `Hello! I am your **muCitizen assistant**.\n\n` +
      `I can help you with:\n` +
      `• Tracking any request by typing its code (e.g. *Track SR-202610-8A190*)\n` +
      `• Inquiring about department resolution SLAs (e.g. *What is the SLA for water leaks?*)\n` +
      `• Step-by-step reporting instructions\n` +
      (role !== Role.CITIZEN ? `• Providing operational dispatch summaries for officers\n\n` : `\n`) +
      `What can I assist you with today?`;
  }
}
