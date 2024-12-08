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

@Resolver()
export class AuthResolver {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private sessionService: SessionService,
    private mailService: MailService,
  ) {}

  @PublicResolver()
  @Mutation(() => signUpLocalDto)
  async signUpLocal(@Args('signUpLocal') signUpLocal: signUpLocalInput) {
    const { repeated_password, ...userData } = signUpLocal;

    const isUserExist = await this.userService.findUserByEmail(userData.email);

    if (isUserExist) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
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

  // TODOING
  @PublicResolver()
  @Mutation(() => signUpLocalDto)
  async signInLocal(@Args('signInLocal') signInLocal: signInLocalInput) {}

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
      throw new NotFoundException('Пользователь не найден');
    }

    return await this.authService.refresh(
      session.refresh_token,
      user.uuid,
      user.email,
    );
  }
}
