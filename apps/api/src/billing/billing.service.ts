import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly stripe: any;

  constructor(private readonly prisma: PrismaService) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing STRIPE_SECRET_KEY');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(user: any) {
    if (!user.associationId) {
      throw new UnauthorizedException('Nessuna associazione attiva');
    }

    if (!process.env.STRIPE_PRICE_ID) {
      throw new BadRequestException('Missing STRIPE_PRICE_ID');
    }

    const association = await this.prisma.association.findUnique({
      where: {
        id: user.associationId,
      },
    });

    if (!association) {
      throw new BadRequestException('Association not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: association.stripeCustomerId || undefined,
      customer_email: association.stripeCustomerId ? undefined : user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        associationId: user.associationId,
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          associationId: user.associationId,
          userId: user.id,
        },
      },
      success_url:
        process.env.STRIPE_SUCCESS_URL ||
        'http://localhost:3000/dashboard?billing=success',
      cancel_url:
        process.env.STRIPE_CANCEL_URL ||
        'http://localhost:3000/dashboard?billing=cancel',
    });

    return {
      url: session.url,
    };
  }

  async handleWebhook(req: any, signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new BadRequestException('Missing STRIPE_WEBHOOK_SECRET');
    }

    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      const associationId = session.metadata?.associationId;

      if (associationId) {
        await this.prisma.association.update({
          where: {
            id: associationId,
          },
          data: {
            stripeCustomerId:
              typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id,
            stripeSubscriptionId:
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription?.id,
            subscriptionStatus: 'active',
          },
        });
      }
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      const subscription = event.data.object as any;

      const associationId = subscription.metadata?.associationId;

      if (associationId) {
        await this.prisma.association.update({
          where: {
            id: associationId,
          },
          data: {
            stripeCustomerId:
              typeof subscription.customer === 'string'
                ? subscription.customer
                : subscription.customer?.id,
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        });
      }
    }

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as any;

      const subscriptionId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        await this.prisma.association.updateMany({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            subscriptionStatus: 'active',
          },
        });
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as any;

      const subscriptionId =
        typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

      if (subscriptionId) {
        await this.prisma.association.updateMany({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          data: {
            subscriptionStatus: 'past_due',
          },
        });
      }
    }

    return {
      received: true,
    };
  }
}