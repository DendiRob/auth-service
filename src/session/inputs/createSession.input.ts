import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class createSessionInput {
  @Field()
  user_uuid: string;

  @Field()
  refresh_token: string;

  @Field()
  refresh_expires_at: number;

  @Field({ nullable: true })
  ip_address?: string;

  @Field({ nullable: true })
  user_agent?: string;
}
