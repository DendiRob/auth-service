import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RefreshInput {
  @Field({ nullable: true })
  refresh_token: string;
}
