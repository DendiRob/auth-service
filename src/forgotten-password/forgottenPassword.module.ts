import { Module } from '@nestjs/common';
import { ForgottenPasswordService } from './forgottenPassword.service';
import { ForgottenPasswordResolver } from './forgottenPassword.resolver';
import { MailService } from 'src/mail/mail.service';

@Module({
  providers: [ForgottenPasswordService, ForgottenPasswordResolver, MailService],
})
export class ForgottenPasswordModule {}
