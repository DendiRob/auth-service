import { Module } from '@nestjs/common';
import { AbilityFactory } from './casl-ability/casl-ability.factory';

@Module({
  providers: [AbilityFactory],
  exports: [AbilityFactory],
})
export class CaslModule {}
