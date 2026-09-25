import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BillingService } from "./billing.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import Stripe from "stripe";

@Controller("billing")
export class BillingController {
  private stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY!,
    {
      apiVersion: "2025-02-24.acacia",
    },
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly billingService: BillingService,
  ) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() body: {
      associationId?: string;
      priceId?: string;
    },
    @CurrentUser() user: JwtUser,
  ) {
    const { associationId, priceId } = body;

    if (!associationId) {
      throw new BadRequestException(
        "associationId mancante",
      );
    }

    if (!priceId) {
      throw new BadRequestException(
        "priceId mancante",
      );
    }

    // Accettiamo solo i Price ID configurati sul backend.
    const allowedPriceIds = [
      process.env.STRIPE_PRICE_ID?.trim(),
      process.env.STRIPE_ENTERPRISE_PRICE_ID?.trim(),
    ].filter(Boolean);
       console.log("STRIPE CHECK", {
  received: priceId?.trim(),
  proConfigured: !!process.env.STRIPE_PRICE_ID,
  enterpriseConfigured: !!process.env.STRIPE_ENTERPRISE_PRICE_ID,
});
    if (!allowedPriceIds.includes(priceId.trim())) {
      throw new BadRequestException(
        "Price ID Stripe non autorizzato",
      );
    }

    const membership =
      await this.prisma.membership.findFirst({
        where: {
          associationId,
          userId: user.id,
        },
        select: {
          role: true,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Non sei membro di questa associazione",
      );
    }

    if (
      membership.role !== "OWNER" &&
      membership.role !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Non hai i permessi per gestire l'abbonamento",
      );
    }

    const association =
      await this.prisma.association.findUnique({
        where: {
          id: associationId,
        },
      });

    if (!association) {
      throw new NotFoundException(
        "Associazione non trovata",
      );
    }

    if (!association.isActive) {
      throw new ForbiddenException(
        "L'associazione non è attiva",
      );
    }

    const subscription =
      await this.billingService.getSubscription(
        associationId,
      );

    if (
      subscription.stripeSubscriptionId &&
      (subscription.status === "ACTIVE" ||
        subscription.status === "TRIALING")
    ) {
      throw new BadRequestException(
        "L'associazione ha già un abbonamento attivo",
      );
    }

    let customerId =
      association.stripeCustomerId;

    if (!customerId) {
      const customer =
        await this.stripe.customers.create({
          metadata: {
            associationId: association.id,
          },
        });

      customerId = customer.id;

      await this.billingService.attachCustomer(
        association.id,
        customerId,
      );
    } else {
      await this.billingService.attachCustomer(
        association.id,
        customerId,
      );
    }

    const frontendUrl =
      process.env.APP_FRONTEND_URL ??
      "http://localhost:3000";

    const session =
      await this.stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [
          {
            price: priceId.trim(),
            quantity: 1,
          },
        ],
        success_url:
          process.env.STRIPE_SUCCESS_URL ??
          `${frontendUrl}/billing/success?success=true`,
        cancel_url:
          process.env.STRIPE_CANCEL_URL ??
          `${frontendUrl}/billing/cancel?canceled=true`,
        metadata: {
          associationId: association.id,
        },
        subscription_data: {
          metadata: {
            associationId: association.id,
          },
        },
      });

    return {
      url: session.url,
    };
  }
}