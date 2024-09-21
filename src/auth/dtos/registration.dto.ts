import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';

@ObjectType()
export class signupLocalDto {
  @Field()
  user: UserDto;

  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}
