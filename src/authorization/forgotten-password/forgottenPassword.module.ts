import { Module } from '@nestjs/common';
import { ForgottenPasswordService } from './forgottenPassword.service';
import { ForgottenPasswordResolver } from './forgottenPassword.resolver';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { SessionModule } from '@src/authorization/session/session.module';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';

@Module({
  providers: [
    ForgottenPasswordService,
    ForgottenPasswordResolver,
    MailService,
    UserService,
    UserConfirmationService,
  ],
  imports: [SessionModule],
})
export class ForgottenPasswordModule {}
