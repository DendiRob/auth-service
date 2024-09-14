import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

@Resolver((of) => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query((returns) => User)
  async user(@Args('id', { type: () => Int }) id: number) {
    const user = this.userService.findUserById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return user;
  }
}
