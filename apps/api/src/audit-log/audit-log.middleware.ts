import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "./audit-log.service";

@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  constructor(private readonly audit: AuditLogService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Passa subito alla route → nessun blocco
    next();

    // Logga solo dopo che la risposta è stata inviata
    res.on("finish", async () => {
      try {
        const user = (req as any).user;
        const actorId = user?.sub ?? null;

        if (!actorId) return; // evita log anonimi

        // Evita log su webhook Stripe
        if (req.originalUrl.includes("billing/webhook")) return;

        // Evita log su audit-log stesso
        if (req.originalUrl.includes("audit-log")) return;

        // Evita log su assets statici
        if (req.originalUrl.includes("static")) return;

        const associationId =
          typeof req.params?.associationId === "string"
            ? req.params.associationId
            : typeof req.body?.associationId === "string"
              ? req.body.associationId
              : typeof req.query?.associationId === "string"
                ? req.query.associationId as string
                : undefined;

        await this.audit.log({
          actorId,
          associationId,
          category: "REQUEST",
          action: `${req.method} ${req.originalUrl}`,
          details: {
            statusCode: res.statusCode,
            method: req.method,
            url: req.originalUrl,
          },
        });
      } catch (err) {
        console.error("AuditLogMiddleware error:", err);
      }
    });
  }
}
