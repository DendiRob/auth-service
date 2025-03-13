import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AbilityFactory } from '@src/authorization/casl/casl-ability/casl-ability.factory';

@Module({
  providers: [UserResolver, UserService, AbilityFactory],
})
export class UserModule {}
