import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';

@Resolver((of) => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => User)
  async user(@Args('id', { type: () => Int }) id: number) {
    const user = await this.userService.findUserById(id);

    if (!user) {
      throw new GraphQLError('Мы не нашли пользователя с таким id', {
        extensions: { code: HttpStatus.NOT_FOUND },
      });
    }
    return user;
  }
}
