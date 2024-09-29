import { Module } from '@nestjs/common';
import { UserConfirmationService } from './userConfirmation.service';
import { UserConfirmationResolver } from './userConfirmation.resolver';
import { UserService } from 'src/user/user.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [UserConfirmationService, UserConfirmationResolver, UserService],
  imports: [MailModule],
})
export class UserConfirmationModule {}
