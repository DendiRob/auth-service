import { HttpStatus, Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { CreateUserInput } from 'src/user/inputs/create-user.input';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import { signUpLocalDto } from './dtos/sign-up-local.dto';
import { TokenService } from 'src/token/token.service';
import { hashData } from 'src/common/utils/bcrypt';
import {
  TUniqueUserFields,
  TUserUpdate,
} from 'src/user/types/user.service.types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private sessionService: SessionService,
    private userConfirmationService: UserConfirmationService,
    private tokenService: TokenService,
  ) {}

  async refresh(oldRefreshToken: string, userUuid: string, userEmail: string) {
    const tokens = await this.tokenService.getTokens(userUuid, userEmail);

    const decodedRefreshToken = this.tokenService.decodeToken(
      tokens.refresh_token,
    );

    const refreshExpiresAt = new Date(decodedRefreshToken.exp * 1000);

    await this.sessionService.updateSession(oldRefreshToken, {
      refresh_expires_at: refreshExpiresAt,
      refresh_token: tokens.refresh_token,
    });

    return tokens;
  }

  // TODO: мне кажется, что тут не должен быть инпут в сервисе, просто обычный тип
  async signUpLocalUser(userInput: CreateUserInput): Promise<signUpLocalDto> {
    const { password, ...restData } = userInput;

    const hashedPasssword = await hashData(password);

    const userData = {
      password: hashedPasssword,
      ...restData,
    };

    const user = await this.userService.createUser(userData);

    const confirmation =
      await this.userConfirmationService.createConfirmationAndSendEmail(user);

    return { user, confirmation };
  }

  async changePassword(userUuid: string, hashedNewPassword: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = this.userService.updateUser(
        { uuid: userUuid },
        { password: hashedNewPassword },
        tx,
      );

      await this.sessionService.closeAllUserSessions(userUuid);

      return user;
    });
  }
}
