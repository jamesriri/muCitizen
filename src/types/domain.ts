export enum Role {
  CITIZEN = "CITIZEN",
  OFFICER = "OFFICER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum RequestStatus {
  PENDING = "PENDING",
  IN_REVIEW = "IN_REVIEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  nationalId?: string | null;
  role: Role;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  slaHours: number;
  iconName: string;
}

export interface AttachmentSummary {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date | string;
}

export interface AuditLogSummary {
  id: string;
  action: string;
  fromStatus?: RequestStatus | null;
  toStatus?: RequestStatus | null;
  comment?: string | null;
  isInternal: boolean;
  createdAt: Date | string;
  actor?: UserSummary | null;
}

export interface ServiceRequestSummary {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: Priority;
  locationAddress: string;
  latitude?: number | null;
  longitude?: number | null;
  slaDueDate: Date | string;
  resolvedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  category: CategorySummary;
  citizen: UserSummary;
  assignedTo?: UserSummary | null;
  attachments?: AttachmentSummary[];
  auditLogs?: AuditLogSummary[];
}
