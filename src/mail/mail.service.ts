import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TSendAuthConfirmation, TSendForgottenPasswordLink } from './types';
import { render } from '@react-email/render';
import UserConfirmationEmail from 'emails/user-confirmation-mail/UserConfirmationMail';
import ForgetPasswordMail from 'emails/forget-password-mail/ForgetPasswordMail';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAuthConfirmation(data: TSendAuthConfirmation) {
    // TODO: сделать исключение, если нет домена
    const siteDomain = process.env.FRONTEND_DOMAIN;

    const confirmationLink = `${siteDomain}/${data.user_uuid}/${data.confirmationUuid}`;

    const html = await render(
      UserConfirmationEmail({
        confirmUrl: confirmationLink,
        email: data.to,
        siteName: siteDomain ?? '',
      }),
    );

    await this.mailerService.sendMail({
      to: data.to,
      from: process.env.MAIL_USER,
      subject: `Подтвердите свои аккаунт на ${siteDomain}`,
      html,
    });
  }

  async sendForgottenPasswordLink(data: TSendForgottenPasswordLink) {
    const forgottenPasswordLink = `${process.env.FRONTEND_DOMAIN}/reset-password/${data.forgottenPasswordUuid}`;

    const html = await render(
      ForgetPasswordMail({
        resetPasswordUrl: forgottenPasswordLink,
        userNickname: data.to,
        accountName: data.accountName,
      }),
    );

    await this.mailerService.sendMail({
      to: data.to,
      from: process.env.MAIL_USER,
      subject: 'Запрос на сброс пароля',
      html,
    });
  }
}
