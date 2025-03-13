import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokensDto {
  @Field(() => String)
  refresh_token: string;

  @Field(() => String)
  access_token: string;
}
