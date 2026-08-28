import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "stdout", level: "error" },
        { emit: "stdout", level: "warn" },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log("Connecting Prisma...");
    await this.$connect();
    this.logger.log("Prisma connected");
  }

  async onModuleDestroy() {
    this.logger.log("Disconnecting Prisma...");
    await this.$disconnect();
  }

  async transactional<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => fn(tx));
  }
}