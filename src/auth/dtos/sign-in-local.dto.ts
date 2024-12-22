import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';
import { refreshDto } from './refresh.dto';

@ObjectType()
export class SignInLocalDto extends refreshDto {
  @Field()
  user: UserDto;
}
