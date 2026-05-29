import { Injectable } from '@nestjs/common';
import StripePackage from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: any;

  constructor() {
    this.stripe = new StripePackage(process.env.STRIPE_SECRET_KEY || '');
  }

  get client(): any {
    return this.stripe;
  }
}