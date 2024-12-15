import { Module } from '@nestjs/common';
import { ForgottenPasswordService } from './forgottenPassword.service';
import { ForgottenPasswordResolver } from './forgottenPassword.resolver';

@Module({
  providers: [ForgottenPasswordService, ForgottenPasswordResolver],
})
export class ForgottenPasswordModule {}
