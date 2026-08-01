import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    const rawApiKey =
      this.configService.get<string>('RESEND_API_KEY');

    if (!rawApiKey) {
      throw new Error('RESEND_API_KEY non trovata nel file .env');
    }

    const apiKey = rawApiKey
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .trim();

    this.resend = new Resend(apiKey);
  }

  async sendInvitationEmail({
    to,
    associationName,
    inviteUrl,
  }: {
    to: string;
    associationName: string;
    inviteUrl: string;
  }) {
    const from =
      this.configService.get<string>('INVITATION_FROM_EMAIL') ||
      'App <onboarding@resend.dev>';

    return this.resend.emails.send({
      from,
      to,
      subject: `Invito a ${associationName}`,
      html: `<a href="${inviteUrl}">Accetta invito</a>`,
    });
  }
}