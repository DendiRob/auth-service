import { AbilityBuilder, ExtractSubjectType, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { Injectable } from '@nestjs/common';
import { CaslActions, Permission, User } from '@prisma/client';

type AppAbility = PureAbility<
  [
    string,
    TaggedSubjects<{
      User: User;
    }>,
  ],
  PrismaQuery
>;

type WithTypename<T extends object, TName extends string> = T & {
  __typename: TName;
};
type TaggedSubjects<T extends Record<string, Record<string, unknown>>> =
  | keyof T
  | { [K in keyof T]: WithTypename<T[K], K & string> }[keyof T];

@Injectable()
export class AbilityFactory {
  defineAbility(user: User & { permissions: Permission[] }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      createPrismaAbility,
    );

    // can(CaslActions.read, 'User');
    // cannot(CaslActions.read, 'User', {
    //   uuid: 'asdsa',
    // }).because('asdasd');

    return build({ detectSubjectType: (object) => object.__typename });
  }
}
