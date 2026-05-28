import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly stripeClient: any;

  constructor(private readonly prisma: PrismaService) {
    this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  }

  async createCheckoutSession(associationId: string) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new BadRequestException('STRIPE_SECRET_KEY mancante');
    }

    if (!process.env.STRIPE_PRICE_ID) {
      throw new BadRequestException('STRIPE_PRICE_ID mancante');
    }

    const session = await this.stripeClient.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url:
        process.env.STRIPE_SUCCESS_URL ??
        'http://localhost:3000/dashboard/billing?success=true',
      cancel_url:
        process.env.STRIPE_CANCEL_URL ??
        'http://localhost:3000/dashboard/billing?canceled=true',
      metadata: {
        associationId,
      },
    });

    return {
      url: session.url,
    };
  }

  async handleWebhook(payload: Buffer | string, signature: string) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET mancante');
    }

    const event = this.stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const associationId = session.metadata?.associationId;

      if (associationId) {
        await this.prisma.association.update({
          where: { id: associationId },
          data: {},
        });
      }
    }

    return { received: true };
  }
}