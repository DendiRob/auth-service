import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class createSessionInput {
  @Field()
  userUuid: string;

  @Field()
  refreshToken: string;

  @Field()
  refreshExpiresAt: Date;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;
}
