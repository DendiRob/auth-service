import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { Permission, User } from '@prisma/client';

export type TSubjects = Subjects<{
  User: User;
}>;

type AppAbility = PureAbility<[string, TSubjects], PrismaQuery>;

@Injectable()
export class AbilityFactory {
  defineAbilityFor(user: User & { permissions: Permission[] }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    can('read', 'User', { uuid: user.uuid });

    return build();
  }
}
