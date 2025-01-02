import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UniqueUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  uuid?: string;
}
