import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';

@ObjectType()
export class signUpLocalDto {
  @Field()
  user: UserDto;

  @Field()
  confirmation_link: string;
}
