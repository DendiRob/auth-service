import { PublicResolver } from '@decorators/public-resolver.decorator';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ResetPassordInput } from './inputs/resetPassword.input';
import { ForgottenPasswordService } from './forgottenPassword.service';
import { throwException } from 'src/common/utils/service-error-handler';
import { HttpStatus } from '@nestjs/common';
import { FORGOTTEN_PASSWORD_ERRORS } from './constants/errors';
import { hashData } from 'src/common/utils/bcrypt';
import { UserService } from 'src/user/user.service';
import USER_ERRORS from 'src/user/constants/errors';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from '@decorators/user-agent-and-ip.decorator';
import { ForgotPasswordInput } from 'src/auth/inputs/forgot-password.input';
import USER_CONFIRMATION_ERRORS from 'src/user-confirmation/constants/errors';

@Resolver()
export class ForgottenPasswordResolver {
  constructor(
    private forgottenPasswordService: ForgottenPasswordService,
    private userService: UserService,
    private userConfirmationService: UserConfirmationService,
  ) {}

  @PublicResolver()
  @Mutation(() => String)
  async resetPassword(
    @Args('resetPassordInput') resetPassordInput: ResetPassordInput,
  ) {
    const { forgottenPasswordSessionUuid, newPassword } = resetPassordInput;

    // TODO: Проверка существует ли юзер в отедльный сервис
    const currentSession =
      await this.forgottenPasswordService.findForgottenPasswordByUuid(
        forgottenPasswordSessionUuid,
      );

    if (!currentSession) {
      return throwException(
        HttpStatus.NOT_FOUND,
        FORGOTTEN_PASSWORD_ERRORS.FORGOTTEN_PASSWORD_NOT_FOUND,
      );
    }

    const user = await this.userService.findUserByUuid(
      currentSession.user_uuid,
    );

    if (!user || user.is_deleted) {
      return throwException(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND);
    }

    const IsSessionExpired =
      this.forgottenPasswordService.isForgottenPasswordExpired(currentSession);

    if (currentSession.is_reseted || IsSessionExpired) {
      return throwException(
        HttpStatus.FORBIDDEN,
        FORGOTTEN_PASSWORD_ERRORS.SESSION_IS_NOT_VALID,
      );
    }

    const hashedPasssword = await hashData(newPassword);

    await this.forgottenPasswordService.resetPassword(
      user.uuid,
      hashedPasssword,
    );

    return 'Пароль успешно изменён.';
  }

  @PublicResolver()
  @Mutation(() => String)
  async forgotPassword(
    @Args('forgotPassword') forgotPassword: ForgotPasswordInput,
    @UserAgentAndIp() userAgentAndIp: TUserAgentAndIp,
  ) {
    const { email } = forgotPassword;
    const { ip_address, user_agent } = userAgentAndIp;

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      return throwException(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND);
    }

    // TODO: бойлерплейт(повторяется проверка на акативный аккаунт) ,возможно нужно вынести все в отдельную функцию
    if (!user.is_activated) {
      const lastConfirmation =
        await this.userConfirmationService.findLastUserConfirmation(user.uuid);

      if (lastConfirmation) {
        const result =
          await this.userConfirmationService.checkAndHandleUserConfirmation(
            user,
            lastConfirmation,
          );

        throwException(result.code, result.msg);
      } else {
        this.userConfirmationService.createConfirmationAndSendEmail(user);
        return throwException(
          HttpStatus.UNAUTHORIZED,
          USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
        );
      }
    }

    const forgottenPassword =
      await this.forgottenPasswordService.findLastForgottenPassword(user.uuid);

    const isForgottenPasswordExpired = forgottenPassword
      ? this.forgottenPasswordService.isForgottenPasswordExpired(
          forgottenPassword,
        )
      : null;

    if (isForgottenPasswordExpired !== null && !isForgottenPasswordExpired) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        FORGOTTEN_PASSWORD_ERRORS.ACTIVE_FORGOTTEN_PASSWORD,
      );
    }

    const data = {
      user_uuid: user.uuid,
      ip_address,
      user_agent,
      email,
    };

    await this.forgottenPasswordService.createForgottenPasswordAndSendEmail(
      data,
    );

    return 'Письмо для восстановления пароля отправлено вам на почту';
  }
}
