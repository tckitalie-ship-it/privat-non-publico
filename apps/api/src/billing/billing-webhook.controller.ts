import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from "@nestjs/common";
import { BillingService } from "./billing.service";
import Stripe from "stripe";

@Controller("billing/webhook")
export class BillingWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  });

  constructor(private readonly billing: BillingService) {}

  @Post()
  async handleWebhook(
    @Req() req: any,
    @Headers("stripe-signature") signature: string
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      throw new BadRequestException("Webhook signature invalid");
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const association = await this.billing.findByCustomerId(customerId);

        await this.billing.updateSubscription(association.id, {
          subscriptionStatus: subscription.status,
          subscriptionCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const association = await this.billing.findByCustomerId(customerId);

        await this.billing.updateSubscription(association.id, {
          subscriptionStatus: null,
          subscriptionCurrentPeriodEnd: null,
        });

        break;
      }

      default:
        break;
    }

    return { received: true };
  }
}
