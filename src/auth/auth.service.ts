import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { CreateUserInput } from 'src/user/inputs/create-user.input';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import { signUpLocalDto } from './dtos/sign-up-local.dto';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private userConfirmationService: UserConfirmationService,
    private tokenService: TokenService,
  ) {}

  // TODO: нужно вынести работу с токенами в отдельный сервис
  async hashData(data: string | Buffer) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(data, salt);
  }

  compareUserPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  // TODO: мне кажется, что тут не должен быть инпут в сервисе, просто обычный тип
  async signUpLocalUser(userInput: CreateUserInput): Promise<signUpLocalDto> {
    const { password, ...restData } = userInput;

    const hashedPasssword = await this.hashData(password);

    const userData = {
      password: hashedPasssword,
      ...restData,
    };

    const user = await this.userService.createUser(userData);

    const confirmation =
      await this.userConfirmationService.createConfirmationAndSendEmail(user);

    return { user, confirmation };
  }

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
}
