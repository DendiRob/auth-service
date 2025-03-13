import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { TokenModule } from 'src/token/token.module';

@Module({
  providers: [SessionService],
  exports: [SessionService],
  imports: [TokenModule],
})
export class SessionModule {}
