import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class signupLocalInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field()
  repeated_password: string;
}
