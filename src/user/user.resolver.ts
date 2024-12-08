import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { NotFoundException } from '@exceptions/gql-exceptions-shortcuts';

@Resolver((of) => UserDto)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => UserDto)
  async user(@Args('uuid', { type: () => String }) uuid: string) {
    const user = await this.userService.findUserByUuid(uuid);

    if (!user) {
      throw new NotFoundException('Мы не нашли пользователя с таким id');
    }
    return user;
  }
}
