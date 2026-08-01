import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { AuditLogService } from "./audit-log.service";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const user = req.user;
    const actorId = user?.sub ?? null;

    // Evita log anonimi
    if (!actorId) return next.handle();

    // Evita log su webhook Stripe
    if (req.originalUrl.includes("billing/webhook")) return next.handle();

    // Evita log su audit-log stesso
    if (req.originalUrl.includes("audit-log")) return next.handle();

    // Associazione (se presente)
    const associationId =
      req.params?.associationId ??
      req.body?.associationId ??
      null;

    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - now;

        await this.audit.log({
          actorId,
          associationId,
          category: "REQUEST",
          action: `${req.method} ${req.originalUrl}`,
          details: {
            statusCode: res.statusCode,
            durationMs: duration,
            responseSize: data ? JSON.stringify(data).length : 0,
          },
        });
      }),
      catchError(async (err) => {
        const duration = Date.now() - now;

        await this.audit.log({
          actorId,
          associationId,
          category: "REQUEST",
          action: `${req.method} ${req.originalUrl}`,
          details: {
            statusCode: res.statusCode,
            durationMs: duration,
            error: err.message,
          },
        });

        throw err;
      })
    );
  }
}
