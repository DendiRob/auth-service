import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';
import { TokensDto } from './tokens.dto';

@ObjectType()
export class SignInDto extends TokensDto {
  @Field()
  user: UserDto;
}
