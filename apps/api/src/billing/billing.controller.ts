import { Body, Controller, Post } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import Stripe from "stripe";

@Controller("billing")
export class BillingController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  });

  constructor(private prisma: PrismaService) {}

  @Post("checkout")
  async createCheckout(@Body() body: any) {
    const { associationId, priceId } = body;

    if (!associationId) {
      throw new Error("associationId mancante");
    }

    if (!priceId) {
      throw new Error("priceId mancante");
    }

    const association = await this.prisma.association.findUnique({
      where: {
        id: associationId,
      },
    });

    if (!association) {
      throw new Error("Associazione non trovata");
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