import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { UserService } from 'src/user/user.service';
import { HttpStatus } from '@nestjs/common';
import { signupLocalDto } from './dtos/registration.dto';
import { signupLocalInput } from './inputs/signupLocal.input';
import { AuthService } from './auth.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from 'src/common/decorators/userAgentAndIp.decorator';

@Resolver()
export class AuthResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Mutation(() => signupLocalDto)
  async signupLocal(
    @Args('signupLocal') signupLocal: signupLocalInput,
    @UserAgentAndIp() sessionInfo: TUserAgentAndIp,
  ) {
    const { repeated_password, ...userData } = signupLocal;

    const isUserExist = await this.userService.findUserByEmail(userData.email);

    if (isUserExist) {
      throw new GraphQLError('Пользователь с таким email уже существует', {
        extensions: { code: HttpStatus.BAD_REQUEST },
      });
    }

    if (userData.password !== repeated_password) {
      throw new GraphQLError('Введенные пароли не совпадают', {
        extensions: { code: HttpStatus.BAD_REQUEST },
      });
    }
    // TODO: тут будет ещё проверка на валидный email адрес

    const createdUser = await this.authService.signupLocalUser(
      userData,
      sessionInfo,
    );

    return createdUser;
  }
}
