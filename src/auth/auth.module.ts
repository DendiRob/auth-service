import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { SessionService } from 'src/session/session.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';

@Module({
  providers: [
    AuthService,
    AuthResolver,
    UserService,
    SessionService,
    RefreshTokenStrategy,
    AccessTokenStrategy,
  ],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
