import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TSendAuthConfirmation } from './types';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAuthConfirmation(data: TSendAuthConfirmation) {
    const confirmationLink = `${process.env.CONFIRMATION_DOMAIN}/${data.user_uuid}/${data.confirmationUuid}`;

    await this.mailerService.sendMail({
      to: data.to,
      from: process.env.MAIL_USER,
      subject: 'Confirm your account',
      html: `<h1>${confirmationLink}</h1>`,
    });
  }
}
