import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { SignUpLocalInput } from './inputs/sign-up-local.input';
import { AuthService } from './auth.service';
import { SessionService } from 'src/session/session.service';
import { refreshDto } from './dtos/refresh.dto';
import { GqlRefreshTokenGuard } from './strategies';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { SignUpLocalDto } from './dtos/sign-up-local.dto';
import { SignInInput } from './inputs/sign-in.input';
import { SignInDto } from './dtos/sign-in.dto';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from '@decorators/user-agent-and-ip.decorator';
import { TokenService } from 'src/token/token.service';
import { compareHashedData, hashData } from 'src/common/utils/bcrypt';
import AUTH_ERRORS from './constants/errors';
import { ServiceError, throwException } from 'src/common/utils/throw-exception';
import SESSION_ERRORS from 'src/session/constants/errors';
import { ChangePasswordInput } from './inputs/change-password.input';
import { AuthenticatedRequest, GqlResponse } from 'src/common/types';

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
  async refresh(
    @Context('req') req: Request,
  ): Promise<GqlResponse<refreshDto>> {
    const refreshToken =
      req.headers[process.env.REFRESH_TOKEN_HEADER as string];

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
  @Mutation(() => SignUpLocalDto)
  async signUpLocal(
    @Args('signUpLocal') signUpLocal: SignUpLocalInput,
  ): Promise<GqlResponse<SignUpLocalDto>> {
    const { repeatedPassword, ...userData } = signUpLocal;

    const isUserExist = await this.userService.findUserByUnique({
      email: userData.email,
    });

    if (isUserExist) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        AUTH_ERRORS.USER_IS_REGISTRATED,
      );
    }

    const hashedPasssword = await hashData(userData.password);

    const createUserData = {
      ...userData,
      password: hashedPasssword,
    };

    const user = await this.userService.createUser(createUserData);

    const confirmation =
      await this.userConfirmationService.createConfirmationAndSendEmail(user);

    return { user, confirmation };
  }

  // TODO: убрать локал, так как есть отдельная стратегия аутентификации с таким названием, у нас jwt based
  @PublicResolver()
  @Mutation(() => SignInDto)
  async signIn(
    @Args('signIn') signIn: SignInInput,
    @UserAgentAndIp() userAgentAndIp: TUserAgentAndIp,
  ): Promise<GqlResponse<SignInDto>> {
    const { email, password } = signIn;
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

      return throwException(result.code, result.msg);
    }

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
      user: userResult,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @Mutation(() => String)
  async logout(
    @Context('req') req: AuthenticatedRequest,
  ): Promise<GqlResponse<String>> {
    const refresh = req.headers[process.env.REFRESH_TOKEN_HEADER as string];
    const session = await this.sessionService.getSessionByRefreshToken(refresh);

    if (!refresh || !session) {
      return throwException(
        HttpStatus.UNAUTHORIZED,
        SESSION_ERRORS.SESSION_NOT_FOUND,
      );
    }

    if (!session.is_active) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        SESSION_ERRORS.SESSION_IS_CLOSED,
      );
    }

    await this.sessionService.updateSessionByRefresh(refresh, {
      is_active: false,
    });

    return 'Сессия успешно закрыта';
  }

  @Mutation(() => String)
  async changePassword(
    @Args('changePassword') changePasswordInput: ChangePasswordInput,
    @Context('req') req: AuthenticatedRequest,
  ): Promise<GqlResponse<string>> {
    const { oldPassword, newPassword } = changePasswordInput;
    const { sub: userUuid } = req.user;

    const userResult = await this.userService.findActiveUserByUnique({
      uuid: userUuid,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    const isOldPasswordValid = await compareHashedData(
      oldPassword,
      userResult.password,
    );

    if (!isOldPasswordValid) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        AUTH_ERRORS.INCORRECT_CURRENT_PASSWORD,
      );
    }

    const hashedNewPasssword = await hashData(newPassword);

    await this.authService.changePassword(userUuid, hashedNewPasssword);

    return 'Пароль успешно изменен';
  }
}
