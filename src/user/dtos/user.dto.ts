import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user-dto' })
export class UserDto {
  @Field((type) => ID)
  id: number;

  @Field((type) => ID)
  uuid: string;

  @Field((type) => String)
  email: string;

  @Field((type) => String, { nullable: true })
  username: string | null;

  @Field((type) => Date)
  created_at: Date;

  @Field(() => Boolean)
  is_deleted: boolean;

  @Field(() => Boolean)
  is_activated: boolean;
}
