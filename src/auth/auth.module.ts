import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserService } from 'src/user/user.service';
import { SessionService } from 'src/session/session.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { MailModule } from 'src/mail/mail.module';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import { TokenModule } from 'src/token/token.module';
import { ForgottenPasswordService } from 'src/forgotten-password/forgottenPassword.service';
import { RolePermissionService } from '@src/role-permission/rolePermission.service';

@Module({
  providers: [
    AuthService,
    AuthResolver,
    UserService,
    SessionService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
    UserConfirmationService,
    ForgottenPasswordService,
    RolePermissionService,
  ],
  imports: [MailModule, TokenModule],
})
export class AuthModule {}
