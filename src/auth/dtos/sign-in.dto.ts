import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';
import { RefreshDto } from './refresh.dto';

@ObjectType()
export class SignInDto extends RefreshDto {
  @Field()
  user: UserDto;
}
