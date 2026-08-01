import {
  Controller,
  Post,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: any;

    try {
      event = this.stripeService.client.webhooks.constructEvent(
        (req as any).rawBody,
        signature,
        endpointSecret,
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        console.log('✅ PAGAMENTO COMPLETATO', {
          associationId: session.metadata?.associationId,
        });

        break;
      }

      default:
        console.log(`Evento non gestito: ${event.type}`);
    }

    return { received: true };
  }
}