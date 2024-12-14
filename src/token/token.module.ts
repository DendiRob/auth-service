import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [TokenService],
  exports: [TokenService],
  imports: [JwtModule.register({})],
})
export class TokenModule {}
