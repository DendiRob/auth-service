import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TSendAuthConfirmation, TSendForgottenPasswordLink } from './types';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAuthConfirmation(data: TSendAuthConfirmation) {
    const confirmationLink = `${process.env.FRONTEND_DOMAIN}/${data.user_uuid}/${data.confirmationUuid}`;

    // await this.mailerService.sendMail({
    //   to: data.to,
    //   from: process.env.MAIL_USER,
    //   subject: 'Confirm your account',
    //   html: `<h1>${confirmationLink}</h1>`,
    // });
    console.log('confirmationLink is sended');
  }

  async sendForgottenPasswordLink(data: TSendForgottenPasswordLink) {
    const forgottenPasswordLink = `${process.env.FRONTEND_DOMAIN}/reset-password/${data.forgottenPasswordUuid}`;

    // await this.mailerService.sendMail({
    //   to: data.to,
    //   from: process.env.MAIL_USER,
    //   subject: 'reset password',
    //   html: `<h1>${forgottenPasswordLink}</h1>`,
    // });
    console.log('forgottenPasswordLink is sended');
  }
}
