import {
  Controller,
  Post,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckout(@Req() req: any) {
    return this.billingService.createCheckoutSession(req.user);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req, signature);
  }
}