import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { JwtUser } from "../auth/jwt-user.interface";
import Stripe from "stripe";

@Controller("billing")
export class BillingController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  constructor(private prisma: PrismaService) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Body() body: { associationId?: string; priceId?: string },
    @CurrentUser() user: JwtUser,
  ) {
    const { associationId, priceId } = body;

    if (!associationId) {
      throw new BadRequestException("associationId mancante");
    }

    if (!priceId) {
      throw new BadRequestException("priceId mancante");
    }

    const membership = await this.prisma.membership.findFirst({
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

    const association = await this.prisma.association.findUnique({
      where: {
        id: associationId,
      },
    });

    if (!association) {
      throw new NotFoundException("Associazione non trovata");
    }

    let customerId = association.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        metadata: {
          associationId: association.id,
        },
      });

      customerId = customer.id;

      await this.prisma.association.update({
        where: {
          id: association.id,
        },
        data: {
          stripeCustomerId: customerId,
        },
      });
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
            price: priceId,
            quantity: 1,
          },
        ],
        success_url:
          `${frontendUrl}/dashboard/billing?success=true`,
        cancel_url:
          `${frontendUrl}/dashboard/billing?canceled=true`,
        metadata: {
          associationId,
        },
      });

    return {
      url: session.url,
    };
  }
}
