import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';

@ObjectType()
export class SignInDto {
  @Field()
  user: UserDto;
}
