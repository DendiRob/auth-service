import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { signUpLocalInput } from './inputs/sign-up-local.input';
import { AuthService } from './auth.service';
import { SessionService } from 'src/session/session.service';
import { refreshDto } from './dtos/refresh.dto';
import { GqlRefreshTokenGuard } from './strategies';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { signUpLocalDto } from './dtos/sign-up-local.dto';
import { signInLocalInput } from './inputs/sign-in-local.input';
import { signInLocalDto } from './dtos/sign-in-local.dto';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from '@decorators/user-agent-and-ip.decorator';
import { TokenService } from 'src/token/token.service';
import { compareHashedData } from 'src/common/utils/bcrypt';
import USER_ERRORS from 'src/user/constants/errors';
import USER_CONFIRMATION_ERRORS from 'src/user-confirmation/constants/errors';
import AUTH_ERRORS from './constants/errors';
import {
  ServiceError,
  throwException,
} from 'src/common/utils/service-error-handler';
import SESSION_ERRORS from 'src/session/constants/errors';
import { ForgottenPasswordService } from 'src/forgotten-password/forgottenPassword.service';

@Resolver()
export class AuthResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private sessionService: SessionService,
    private userConfirmationService: UserConfirmationService,
    private tokenService: TokenService,
  ) {}

  @PublicResolver()
  @UseGuards(GqlRefreshTokenGuard)
  @Mutation(() => refreshDto)
  async refresh(@Context('req') req: any) {
    const refreshToken = req.headers['refresh-token'];

    const session =
      await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!session || !session.is_active) {
      return throwException(
        HttpStatus.UNAUTHORIZED,
        SESSION_ERRORS.USER_SESSION_NOT_FOUND_OR_CLOSED,
      );
    }

    const userResult = await this.userService.findActiveUserByUnique({
      uuid: session.user_uuid,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    return await this.authService.refresh(
      session.refresh_token,
      userResult.uuid,
      userResult.email,
    );
  }

  @PublicResolver()
  @Mutation(() => signUpLocalDto)
  async signUpLocal(@Args('signUpLocal') signUpLocal: signUpLocalInput) {
    const { repeated_password, ...userData } = signUpLocal;

    const isUserExist = await this.userService.findUserByUnique({
      email: userData.email,
    });

    if (isUserExist) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        AUTH_ERRORS.USER_IS_REGISTRATED,
      );
    }

    const { user, confirmation } =
      await this.authService.signUpLocalUser(userData);

    return { user, confirmation };
  }

  @PublicResolver()
  @Mutation(() => signInLocalDto)
  async signInLocal(
    @Args('signInLocal') signInLocal: signInLocalInput,
    @UserAgentAndIp() userAgentAndIp: TUserAgentAndIp,
  ) {
    const { email, password } = signInLocal;
    const { ip_address, user_agent } = userAgentAndIp;

    const userResult = await this.userService.findActiveUserByUnique({
      email,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    const isPasswordValid = await compareHashedData(
      password,
      userResult.password,
    );

    if (!isPasswordValid) {
      throwException(HttpStatus.UNAUTHORIZED, AUTH_ERRORS.INCORRECT_PASSWORD);
    }

    if (!userResult.is_activated) {
      const result =
        await this.userConfirmationService.userIsNotActivatedProccess(
          userResult,
        );

      throwException(result.code, result.msg);
    }

    // TODO: после того как добавим еще методы авторизации, возможно это надо вынести в отдельную функцию сервиса
    const tokens = await this.tokenService.getTokens(
      userResult.uuid,
      userResult.email,
    );

    const sessionData = {
      user_uuid: userResult.uuid,
      refresh_token: tokens.refresh_token,
      ip_address,
      user_agent,
    };

    await this.sessionService.createSession(sessionData);

    return {
      userResult,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }
}
