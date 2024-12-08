import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { SessionService } from 'src/session/session.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { MailModule } from 'src/mail/mail.module';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';

@Module({
  providers: [
    AuthService,
    AuthResolver,
    UserService,
    SessionService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    UserConfirmationService,
  ],
  imports: [JwtModule.register({}), MailModule],
})
export class AuthModule {}
