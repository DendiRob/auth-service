import { AbilityBuilder, ForbiddenError, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CaslActions, User } from '@prisma/client';
import { TUserRequest } from '@src/authorization/auth/types';
import { interpolateObject } from '@src/common/utils/interpolate';
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

    user.permissions.forEach((permission) => {
      const subject = permission.subject as any;
      const conditions = (permission?.conditions as any) || undefined;

      permission.inverted
        ? cannot(permission.action, subject, conditions).because(
            permission?.reason ?? 'Доступ закрыт',
          )
        : can(
            permission.action,
            subject,
            interpolateObject(conditions, { user }),
          );
    });

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
