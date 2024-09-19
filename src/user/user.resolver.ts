import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { HttpStatus } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { CreateUserInput } from './inputs/create-user.input';

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

  @Mutation(() => User)
  async createUser(@Args('createUser') creatUserInput: CreateUserInput) {
    try {
      // return await this.userService.createUser(creatUserInput);
    } catch (error) {
      // TODO: Здесь должен быть логгер для записи ошибки
      throw new GraphQLError('Не получилось создать пользователя');
    }
  }
}
