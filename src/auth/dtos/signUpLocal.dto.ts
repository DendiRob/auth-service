import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';
import { UserConfirmationDto } from 'src/userConfirmation/dtos/user-confirmation.dto';

@ObjectType()
export class signUpLocalDto {
  @Field()
  user: UserDto;

  @Field()
  confirmation: UserConfirmationDto;
}
