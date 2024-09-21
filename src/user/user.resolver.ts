import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { UserDto } from './dtos/user.dto';

@Resolver((of) => UserDto)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => UserDto)
  async user(@Args('uuid', { type: () => String }) uuid: string) {
    const user = await this.userService.findUserByUuid(uuid);

    if (!user) {
      throw new GraphQLError('Мы не нашли пользователя с таким id', {
        extensions: { code: HttpStatus.NOT_FOUND },
      });
    }
    return user;
  }
}
