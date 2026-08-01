import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingWebhookController } from './billing-webhook.controller';
import { BillingService } from './billing.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    BillingController,        // /api/billing/checkout
    BillingWebhookController, // /api/billing/webhook
  ],
  providers: [BillingService],
})
export class BillingModule {}
