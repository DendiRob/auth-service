import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user-dto' })
export class UserDto {
  @Field((type) => ID)
  uuid: string;

  @Field((type) => String)
  email: string;

  @Field({ nullable: true })
  name: string | null;

  @Field()
  created_at: Date;

  @Field(() => Boolean)
  is_deleted: boolean;

  @Field(() => Boolean)
  is_activated: boolean;
}
