import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'user' })
export class User {
  @Field((type) => ID)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field()
  createdAt: Date;

  @Field((type) => String)
  email: string;
}
