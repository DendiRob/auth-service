import { SetMetadata } from '@nestjs/common';
import { CaslActions } from '@prisma/client';
import { TSubjects } from './casl-ability.factory';

export type TRequiredRule = {
  action: CaslActions;
  subject: TSubjects;
};

export const CHECK_ABILITY = 'CHECK_ABILITY';

export const CheckAbilities = (...abilities: TRequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, abilities);
