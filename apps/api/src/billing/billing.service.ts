import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Salva lo Stripe Customer ID nell’associazione
   */
  async attachCustomer(associationId: string, stripeCustomerId: string) {
    return this.prisma.association.update({
      where: { id: associationId },
      data: { stripeCustomerId },
    });
  }

  /**
   * Aggiorna lo stato della sottoscrizione
   */
  async updateSubscription(associationId: string, data: {
    subscriptionStatus?: string | null;
    subscriptionCurrentPeriodEnd?: Date | null;
  }) {
    return this.prisma.association.update({
      where: { id: associationId },
      data,
    });
  }

  /**
   * Trova associazione tramite Stripe Customer ID
   */
  async findByCustomerId(customerId: string) {
    const association = await this.prisma.association.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata per questo customerId");
    }

    return association;
  }
}
