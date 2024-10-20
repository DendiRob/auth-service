import { Field, ObjectType } from '@nestjs/graphql';
import { UserDto } from 'src/user/dtos/user.dto';
import { refreshDto } from './refresh.dto';

@ObjectType()
export class authDto extends refreshDto {
  @Field()
  user: UserDto;
}
