import { Injectable, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly stripe: any;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createCheckoutSession(user: any) {
    if (!user.associationId) {
      throw new UnauthorizedException('Nessuna associazione attiva');
    }
console.log('STRIPE KEY:', process.env.STRIPE_SECRET_KEY?.slice(-6));
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      metadata: {
        associationId: user.associationId,
        userId: user.id,
      },
      success_url: process.env.STRIPE_SUCCESS_URL!,
      cancel_url: process.env.STRIPE_CANCEL_URL!,
    });

    return { url: session.url };
  }

  async handleWebhook(req: any, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      const associationId = session.metadata?.associationId;

      if (associationId) {
        await this.prisma.association.update({
          where: { id: associationId },
          data: {
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
            subscriptionStatus: 'active',
          },
        });
      }
    }

    return { received: true };
  }
}