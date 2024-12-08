import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserConfirmationDto {
  @Field()
  id: number;

  @Field()
  uuid: string;

  @Field()
  user_uuid: string;

  @Field()
  expires_at: Date;

  @Field()
  created_at: Date;

  @Field()
  is_confirmed: boolean;
}
