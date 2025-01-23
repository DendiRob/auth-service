import { AbilityBuilder, ForbiddenError, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CaslActions, User } from '@prisma/client';
import { TUserRequest } from '@src/auth/types';
import { throwException } from '@src/common/utils/throw-exception';

export type TSubjects = Subjects<{
  User: User;
}>;

export type AppAbility = PureAbility<[string, TSubjects], PrismaQuery>;
export type TRequiredRule = {
  action: CaslActions;
  subject: TSubjects | any;
  message?: string;
};

@Injectable()
export class AbilityFactory {
  defineAbilityFor(user: TUserRequest) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    can('read', 'User', { uuid: user.uuid });

    return build();
  }

  checkAbilities(user: TUserRequest, rules: TRequiredRule[]) {
    const ability = this.defineAbilityFor(user);

    try {
      rules.forEach((rule) =>
        ForbiddenError.from(ability)
          .setMessage(rule.message ?? 'Доступ закрыт')
          .throwUnlessCan(rule.action, rule.subject),
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw throwException(HttpStatus.FORBIDDEN, error.message);
      }
    }
  }
}
