import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { AuditLogService } from "./audit-log.service";
import { AUDIT_ACTION } from "./audit-log.decorator";

@Injectable()
export class AuditLogActionInterceptor implements NestInterceptor {
  constructor(
    private readonly audit: AuditLogService,
    private readonly reflector: Reflector
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(
      AUDIT_ACTION,
      context.getHandler()
    );

    if (!action) return next.handle();

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const actorId = user?.sub ?? null;
    const associationId =
      req.params?.associationId ??
      req.body?.associationId ??
      req.query?.associationId ??
      null;

    const start = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        if (!actorId) return;

        await this.audit.log({
          actorId,
          associationId,
          category: "ACTION",
          action,
          details: {
            method: req.method,
            url: req.originalUrl,
            responseTimeMs: Date.now() - start,
            statusCode: req.statusCode,
            responseSize: response ? JSON.stringify(response).length : 0,
          },
        });
      }),
      catchError(async (err) => {
        if (actorId) {
          await this.audit.log({
            actorId,
            associationId,
            category: "ACTION",
            action,
            details: {
              method: req.method,
              url: req.originalUrl,
              responseTimeMs: Date.now() - start,
              error: err.message,
              stack: err.stack,
            },
          });
        }
        throw err;
      })
    );
  }
}
