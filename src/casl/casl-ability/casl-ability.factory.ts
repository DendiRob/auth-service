import { AbilityBuilder, InferSubjects, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subject = InferSubjects<User> | 'all';
type AppAbility = PureAbility<
  [
    string,
    Subjects<{
      User: User;
    }>,
  ],
  PrismaQuery
>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    cannot(Action.Read, 'User');

    return build();
  }
}
