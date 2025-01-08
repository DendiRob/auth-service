import { PublicResolver } from '@decorators/public-resolver.decorator';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ResetPassordInput } from './inputs/resetPassword.input';
import { ForgottenPasswordService } from './forgottenPassword.service';
import { ServiceError, throwException } from 'src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import { FORGOTTEN_PASSWORD_ERRORS } from './constants/errors';
import { hashData } from 'src/common/utils/bcrypt';
import { UserService } from 'src/user/user.service';
import { UserConfirmationService } from 'src/user-confirmation/userConfirmation.service';
import {
  TUserAgentAndIp,
  UserAgentAndIp,
} from '@decorators/user-agent-and-ip.decorator';
import { ForgotPasswordInput } from 'src/forgotten-password/inputs/forgot-password.input';
import { GqlResponse } from 'src/common/types';
import FORGOTTEN_PASSWORD_SUCCESSES from './constants/successes';

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
  ): Promise<GqlResponse<string>> {
    const { forgottenPasswordSessionUuid, newPassword } = resetPassordInput;

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

    const userResult = await this.userService.findActiveUserByUnique({
      uuid: currentSession.user_uuid,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
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
      userResult.uuid,
      hashedPasssword,
    );

    return FORGOTTEN_PASSWORD_SUCCESSES.PASSWORD_IS_RESETED;
  }

  @PublicResolver()
  @Mutation(() => String)
  async forgotPassword(
    @Args('forgotPassword') forgotPassword: ForgotPasswordInput,
    @UserAgentAndIp() userAgentAndIp: TUserAgentAndIp,
  ): Promise<GqlResponse<string>> {
    const { email } = forgotPassword;
    const { ip_address, user_agent } = userAgentAndIp;

    const userResult = await this.userService.findActiveUserByUnique({
      email,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    if (!userResult.is_activated) {
      const result =
        await this.userConfirmationService.userIsNotActivatedProccess(
          userResult,
        );

      return throwException(result.code, result.msg);
    }

    const forgottenPassword =
      await this.forgottenPasswordService.findLastForgottenPassword(
        userResult.uuid,
      );

    const isForgottenPasswordExpired = forgottenPassword
      ? this.forgottenPasswordService.isForgottenPasswordExpired(
          forgottenPassword,
        )
      : null;

    if (forgottenPassword && !isForgottenPasswordExpired) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        FORGOTTEN_PASSWORD_ERRORS.ACTIVE_FORGOTTEN_PASSWORD,
      );
    }

    const data = {
      user_uuid: userResult.uuid,
      ip_address,
      user_agent,
      email,
    };

    await this.forgottenPasswordService.createForgottenPasswordAndSendEmail(
      data,
    );

    return FORGOTTEN_PASSWORD_SUCCESSES.FORGOTTEN_PASSWORD_SENT;
  }
}
