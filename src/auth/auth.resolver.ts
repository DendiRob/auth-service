import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { registrationInput } from './inputs/registration.input';
import { UserService } from 'src/user/user.service';
import { HttpStatus } from '@nestjs/common';
import { registrationDto } from './dtos/registration.dto';

@Resolver()
export class AuthResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => registrationDto)
  async registration(
    @Args('registration') registrationInput: registrationInput,
  ) {
    try {
      const { email, password, repeatedPassword } = registrationInput;

      const isUserExist = await this.userService.findUserByEmail(email);

      if (!isUserExist) {
        throw new GraphQLError('Пользователь с таким email уже существует', {
          extensions: { code: HttpStatus.BAD_REQUEST },
        });
      }

      if (password !== repeatedPassword) {
        throw new GraphQLError('Введенные пароли не совпадают', {
          extensions: { code: HttpStatus.BAD_REQUEST },
        });
      }

      // TODO: тут будет ещё проверка на валидный имел адрес
    } catch (error) {
      throw new GraphQLError('Не получилось создать пользователя');
    }
  }
}
