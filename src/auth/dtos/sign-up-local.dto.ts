import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';
import { UserConfirmationDto } from 'src/user-confirmation/dtos/user-confirmation.dto';

@ObjectType()
export class SignUpLocalDto {
  @Field()
  user: UserDto;

  @Field()
  confirmation: UserConfirmationDto;
}
