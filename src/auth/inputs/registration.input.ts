import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class registrationInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field()
  repeatedPassword: string;
}
