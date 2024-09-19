import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export abstract class User {
  @Field((type) => ID)
  id: number;

  @Field((type) => String)
  email: string;

  @Field((type) => String)
  password: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  createdAt: Date;

  @Field(() => Boolean, { defaultValue: false })
  isDeleted: boolean;
}
