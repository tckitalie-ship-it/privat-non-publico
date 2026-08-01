import { SetMetadata } from "@nestjs/common";

export const AUDIT_ACTION = "AUDIT_ACTION";

/**
 * Decorator per loggare un'azione specifica
 * Esempio:
 *   @AuditLog("USER_UPDATED")
 */
export const AuditLog = (action: string) =>
  SetMetadata(AUDIT_ACTION, action);
