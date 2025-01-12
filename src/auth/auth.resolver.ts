import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { SignUpInput } from './inputs/sign-up.input';
import { AuthService } from './auth.service';
import { SessionService } from 'src/session/session.service';
import { GqlRefreshTokenGuard } from './strategies';
import { PublicResolver } from '@decorators/public-resolver.decorator';
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
import AUTH_SUCCESSES from './constants/successes';
import { setCookies } from '@src/common/utils/cookies';
import type { Request, Response } from 'express';

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
  @Mutation(() => Boolean)
  async refresh(
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<GqlResponse<boolean>> {
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN_NAME as string];

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

    const tokens = await this.authService.refresh(
      session.refresh_token,
      userResult.uuid,
      userResult.email,
    );

    const cookiesToken = [
      {
        cookieName: process.env.ACCESS_TOKEN_NAME as string,
        cookieValue: tokens.access_token,
      },
      {
        cookieName: process.env.REFRESH_TOKEN_NAME as string,
        cookieValue: tokens.refresh_token,
      },
    ];

    setCookies(res, cookiesToken);
    return true;
  }

  @PublicResolver()
  @Mutation(() => String)
  async signUp(
    @Args('signUp') signUp: SignUpInput,
  ): Promise<GqlResponse<string>> {
    const { repeatedPassword, ...userData } = signUp;

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

    await this.userConfirmationService.createConfirmationAndSendEmail(user);

    return AUTH_SUCCESSES.REGISTRATED;
  }

  @PublicResolver()
  @Mutation(() => SignInDto)
  async signIn(
    @Args('signIn') signIn: SignInInput,
    @UserAgentAndIp() userAgentAndIp: TUserAgentAndIp,
    @Context('res') res: Response,
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

    const cookiesToken = [
      {
        cookieName: process.env.ACCESS_TOKEN_NAME as string,
        cookieValue: tokens.access_token,
      },
      {
        cookieName: process.env.REFRESH_TOKEN_NAME as string,
        cookieValue: tokens.refresh_token,
      },
    ];

    setCookies(res, cookiesToken);

    return {
      user: userResult,
    };
  }

  @UseGuards(GqlRefreshTokenGuard)
  @Mutation(() => String)
  async logout(
    @Context('req') req: AuthenticatedRequest,
  ): Promise<GqlResponse<String>> {
    const refresh = req.cookies[process.env.REFRESH_TOKEN_NAME as string];
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

    return AUTH_SUCCESSES.LOGOUT;
  }

  @UseGuards(GqlRefreshTokenGuard)
  @Mutation(() => String)
  async changePassword(
    @Args('changePassword') changePasswordInput: ChangePasswordInput,
    @Context('req') req: AuthenticatedRequest,
  ): Promise<GqlResponse<string>> {
    const { oldPassword, newPassword } = changePasswordInput;
    const { sub: userUuid } = req.user;
    const refreshToken = req.cookies[process.env.REFRESH_TOKEN_NAME as string];

    const session =
      await this.sessionService.getSessionByRefreshToken(refreshToken);

    if (!session || !session.is_active) {
      return throwException(
        HttpStatus.UNAUTHORIZED,
        SESSION_ERRORS.USER_SESSION_NOT_FOUND_OR_CLOSED,
      );
    }

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

    return AUTH_SUCCESSES.PASSWORD_IS_CHANGED;
  }
}
