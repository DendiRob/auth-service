import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ConfirmUserInput {
  @Field()
  user_uuid: string;

  @Field()
  confirmation_uuid: string;
}
