import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        backend: "online",
        database: "connected",
        api: "operational",
        security: "protected",
      };
    } catch {
      return {
        backend: "online",
        database: "disconnected",
        api: "degraded",
        security: "protected",
      };
    }
  }
}