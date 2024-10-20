import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendMsg() {
    await this.mailerService.sendMail({
      to: 'dendiroblek@gmail.com',
      from: process.env.MAIL_USER,
      subject: 'Testing',
      text: 'Test Text',
      html: '<h1>Hello world</h1>',
    });
  }
}
