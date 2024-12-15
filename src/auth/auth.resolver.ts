import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from 'src/user/user.service';
import { UseGuards } from '@nestjs/common';
import { signUpLocalInput } from './inputs/sign-up-local.input';
import { AuthService } from './auth.service';
import { SessionService } from 'src/session/session.service';
import { refreshDto } from './dtos/refresh.dto';
import { GqlRefreshTokenGuard } from './strategies';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { MailService } from 'src/mail/mail.service';
import { signUpLocalDto } from './dtos/sign-up-local.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@exceptions/gql-exceptions-shortcuts';
import { signInLocalInput } from './inputs/sign-in-local.input';
import { signInLocalDto } from './dtos/sign-in-local.dto';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from '@decorators/user-agent-and-ip.decorator';
import { TokenService } from 'src/token/token.service';
import { forgotPasswordInput } from './inputs/forgot-password.input';
import { compareHashedData } from 'src/common/utils/bcrypt';
import USER_ERRORS from 'src/user/constants/errors';
import USER_CONFIRMATION_ERRORS from 'src/user-confirmation/constants/errors';
import AUTH_ERRORS from './constants/errors';

@Resolver()
export class AuthResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private sessionService: SessionService,
    private mailService: MailService,
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
      throw new UnauthorizedException('Данная сессия не найдена или закрыта');
    }

    const user = await this.userService.findUserByUuid(session.user_uuid);

    if (!user || user.is_deleted) {
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    return await this.authService.refresh(
      session.refresh_token,
      user.uuid,
      user.email,
    );
  }

  @PublicResolver()
  @Mutation(() => signUpLocalDto)
  async signUpLocal(@Args('signUpLocal') signUpLocal: signUpLocalInput) {
    const { repeated_password, ...userData } = signUpLocal;

    const isUserExist = await this.userService.findUserByEmail(userData.email);

    if (isUserExist) {
      throw new BadRequestException(AUTH_ERRORS.USER_IS_REGISTRATED);
    }

    const { user, confirmation } =
      await this.authService.signUpLocalUser(userData);

    await this.mailService.sendAuthConfirmation({
      to: user.email,
      user_uuid: user.uuid,
      confirmationUuid: confirmation.uuid,
    });

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

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    const isPasswordValid = await compareHashedData(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INCORRECT_PASSWORD);
    }

    if (!user.is_activated) {
      const lastConfirmation =
        await this.userConfirmationService.findLastUserConfirmation(user.uuid);

      const isConfirmationValid =
        this.userConfirmationService.isConfirmationExpired(lastConfirmation);

      if (isConfirmationValid) {
        throw new UnauthorizedException(
          USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
        );
      } else {
        return await this.userConfirmationService.checkAndHandleUserConfirmation(
          user,
          lastConfirmation,
        );
      }
    }

    // TODO: после того как добавим еще методы авторизации, возможно это надо вынести в отдельную функцию сервиса
    const tokens = await this.tokenService.getTokens(user.uuid, user.email);

    const sessionData = {
      user_uuid: user.uuid,
      refresh_token: tokens.refresh_token,
      ip_address,
      user_agent,
    };

    await this.sessionService.createSession(sessionData);

    return {
      user,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  @PublicResolver()
  @Mutation(() => String)
  async forgotPassword(
    @Args('forgotPassword') forgotPassword: forgotPasswordInput,
    @UserAgentAndIp() userAgentAndIp: TUserAgentAndIp,
  ) {
    const { email } = forgotPassword;

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    // TODO: бойлерплейт(повторяется проверка на кативный аккаунт) ,возможно нужно вынести все в отдельную функцию
    if (!user.is_activated) {
      const lastConfirmation =
        await this.userConfirmationService.findLastUserConfirmation(user.uuid);

      const isConfirmationValid =
        this.userConfirmationService.isConfirmationExpired(lastConfirmation);

      if (isConfirmationValid) {
        throw new UnauthorizedException(
          USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
        );
      } else {
        return await this.userConfirmationService.checkAndHandleUserConfirmation(
          user,
          lastConfirmation,
        );
      }
    }

    return 'sdadsa';
  }
}
