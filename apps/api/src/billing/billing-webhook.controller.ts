import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from "@nestjs/common";
import Stripe from "stripe";
import { BillingService } from "./billing.service";
import { SubscriptionPlan } from "@prisma/client";

@Controller("billing/webhook")
export class BillingWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  constructor(private readonly billing: BillingService) {}

  @Post()
  async handleWebhook(
    @Req() req: any,
    @Headers("stripe-signature") signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch {
      throw new BadRequestException("Webhook signature invalid");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const associationId =
          session.metadata?.associationId?.trim() || null;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;

        if (associationId && customerId) {
          await this.billing.attachCustomer(
            associationId,
            customerId,
          );
        }

        if (associationId && subscriptionId) {
          await this.billing.updateSubscription(
            associationId,
            {
              stripeSubscriptionId: subscriptionId,
            },
          );
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription =
          event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const association =
          await this.billing.findByCustomerId(customerId);

        const priceId =
          subscription.items.data[0]?.price?.id ?? null;

        const plan =
          this.billing.inferPlanFromPricePublic(priceId);

        await this.billing.updateSubscription(
          association.id,
          {
            subscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd:
              new Date(
                subscription.current_period_end * 1000,
              ),
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            plan,
            currentPeriodStart:
              new Date(
                subscription.current_period_start * 1000,
              ),
            cancelAtPeriodEnd:
              subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at
              ? new Date(
                  subscription.canceled_at * 1000,
                )
              : null,
          },
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription =
          event.data.object as Stripe.Subscription;

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const association =
          await this.billing.findByCustomerId(customerId);

        const priceId =
          subscription.items.data[0]?.price?.id ?? null;

        await this.billing.updateSubscription(
          association.id,
          {
            subscriptionStatus: "canceled",
            subscriptionCurrentPeriodEnd:
              subscription.current_period_end
                ? new Date(
                    subscription.current_period_end * 1000,
                  )
                : null,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            cancelAtPeriodEnd:
              subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at
              ? new Date(
                  subscription.canceled_at * 1000,
                )
              : new Date(),
          },
        );

        break;
      }

      default:
        break;
    }

    return { received: true };
  }
}
