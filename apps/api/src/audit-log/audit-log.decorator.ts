import { SetMetadata } from "@nestjs/common";

export const AUDIT_LOG_METADATA_KEY =
  "audit-log:metadata";

export interface AuditLogMetadata {
  action?: string;
  category?: string;
}

export const AuditLog = (
  metadata: AuditLogMetadata = {},
) =>
  SetMetadata(
    AUDIT_LOG_METADATA_KEY,
    metadata,
  );