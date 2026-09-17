import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap } from "rxjs";

import { AuditLogService } from "./audit-log.service";
import {
  AUDIT_LOG_METADATA_KEY,
  AuditLogMetadata,
} from "./audit-log.decorator";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    const method = String(request.method || "").toUpperCase();

    /*
     * Registriamo solamente operazioni che modificano dati.
     */
    if (!["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      return next.handle();
    }

    const path = String(
      request.originalUrl ||
        request.url ||
        "",
    ).split("?")[0];

    /*
     * Evitiamo di registrare l'Audit Log stesso.
     */
    if (
      path.startsWith("/api/audit-log") ||
      path.includes("/api/audit-log/")
    ) {
      return next.handle();
    }

    const metadata =
      this.reflector.get<AuditLogMetadata | undefined>(
        AUDIT_LOG_METADATA_KEY,
        context.getHandler(),
      );

    return next.handle().pipe(
      tap(() => {
        void this.writeAuditLog(
          request,
          method,
          path,
          metadata,
        );
      }),
    );
  }

  private async writeAuditLog(
    request: any,
    method: string,
    path: string,
    metadata?: AuditLogMetadata,
  ) {
    try {
      const user = request?.user;

      const actorId =
        user?.id ??
        user?.userId ??
        user?.sub ??
        null;

      if (!actorId) {
        return;
      }

      const associationId =
        await this.auditLogService.resolveAssociationIdFromRequest(
          request,
        );

      /*
       * Se non riusciamo a determinare l'associazione,
       * non creiamo un log ambiguo.
       */
      if (!associationId) {
        return;
      }

      const category =
        metadata?.category ??
        this.getCategory(path);

      const action =
        metadata?.action ??
        this.getAction(method, path);

      const userId =
        this.extractTargetUserId(request);

      const details = {
        method,
        path,
        category,
        action,
        statusCode: 200,

        params: this.sanitize(request?.params ?? {}),

        query: this.sanitize(request?.query ?? {}),

        body: this.sanitize(request?.body ?? {}),
      };

      const auditLog =
        await this.auditLogService.create({
          action,
          category,
          details,
          actorId,
          userId,
          associationId,
        });

      /*
       * L'evento viene reso disponibile anche alla parte
       * realtime quando il gateway è presente.
       */
      try {
        const gateway =
          request?.app?.get?.("AuditLogGateway");

        gateway?.emitAuditEvent?.(auditLog);
      } catch {
        // Il realtime non deve mai interrompere l'Audit Log.
      }
    } catch (error) {
      /*
       * L'Audit Log non deve mai bloccare l'operazione
       * principale dell'applicazione.
       */
      console.error(
        "[AuditLogInterceptor] Errore registrazione:",
        error,
      );
    }
  }

  private getCategory(path: string): string {
    const parts = path
      .split("/")
      .filter(Boolean);

    const apiIndex = parts.indexOf("api");

    if (apiIndex === -1) {
      return "other";
    }

    const resource =
      parts[apiIndex + 1] || "other";

    const categories: Record<string, string> = {
      associations: "associations",
      users: "users",
      memberships: "members",
      invitations: "invitations",
      events: "events",
      finances: "finance",
      files: "files",
      reminders: "reminders",
      notifications: "notifications",
      billing: "billing",
      dashboard: "dashboard",
      assistant: "assistant",
    };

    return categories[resource] ?? resource;
  }

  private getAction(
    method: string,
    path: string,
  ): string {
    const lowerPath = path.toLowerCase();

    if (
      method === "POST" &&
      lowerPath.includes("/register")
    ) {
      return "REGISTER";
    }

    if (
      method === "POST" &&
      lowerPath.includes("/accept")
    ) {
      return "ACCEPT";
    }

    if (
      method === "PATCH" &&
      lowerPath.includes("/role")
    ) {
      return "CHANGE_ROLE";
    }

    if (
      method === "PATCH" &&
      lowerPath.includes("/complete")
    ) {
      return "COMPLETE";
    }

    if (
      method === "DELETE" &&
      lowerPath.includes("/register")
    ) {
      return "UNREGISTER";
    }

    if (
      method === "DELETE" &&
      lowerPath.includes("/remove")
    ) {
      return "REMOVE";
    }

    switch (method) {
      case "POST":
        return "CREATE";

      case "PATCH":
      case "PUT":
        return "UPDATE";

      case "DELETE":
        return "DELETE";

      default:
        return method;
    }
  }

  private extractTargetUserId(
    request: any,
  ): string | null {
    const body = request?.body ?? {};
    const params = request?.params ?? {};

    const candidates = [
      body.userId,
      body.userID,
      body.participantUserId,
      body.participantId,
      body.targetUserId,
      params.userId,
      params.participantUserId,
    ];

    for (const candidate of candidates) {
      if (
        typeof candidate === "string" &&
        candidate.trim()
      ) {
        return candidate.trim();
      }
    }

    return null;
  }

  private sanitize(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.sanitize(item),
      );
    }

    const source =
      value as Record<string, unknown>;

    const result: Record<string, unknown> = {};

    const sensitiveKeys = new Set([
      "password",
      "passwordHash",
      "currentPassword",
      "newPassword",
      "confirmPassword",
      "token",
      "access_token",
      "refresh_token",
      "authorization",
      "cookie",
      "secret",
      "apiKey",
      "api_key",
    ]);

    for (const [key, val] of Object.entries(source)) {
      if (sensitiveKeys.has(key)) {
        result[key] = "[REDACTED]";
        continue;
      }

      result[key] = this.sanitize(val);
    }

    return result;
  }
}