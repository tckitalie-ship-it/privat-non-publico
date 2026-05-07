import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendInvitationEmail({
    to,
    associationName,
    inviteUrl,
  }: {
    to: string;
    associationName: string;
    inviteUrl: string;
  }) {
    return this.resend.emails.send({
      from: process.env.EMAIL_FROM || 'App <onboarding@resend.dev>',
      to: [to],
      subject: `Invito a ${associationName}`,
      html: `<a href="${inviteUrl}">Accetta invito</a>`,
    });
  }
}