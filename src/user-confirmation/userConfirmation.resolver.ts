import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { HttpStatus } from '@nestjs/common';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { UserConfirmationService } from './userConfirmation.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { UserService } from 'src/user/user.service';
import USER_CONFIRMATION_ERRORS from './constants/errors';
import USER_ERRORS from 'src/user/constants/errors';
import { throwException } from 'src/common/utils/service-error-handler';

@Resolver()
export class UserConfirmationResolver {
  constructor(
    private userConfirmationService: UserConfirmationService,
    private userService: UserService,
  ) {}

  @PublicResolver()
  @Mutation(() => String)
  async confirmUser(
    @Args('confirmUserInput') confirmUserInput: ConfirmUserInput,
  ) {
    const { confirmation_uuid, user_uuid } = confirmUserInput;

    const user = await this.userService.findUserByUuid(user_uuid);

    if (!user) {
      throwException(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND);
    }

    if (user.is_activated) {
      throwException(HttpStatus.BAD_REQUEST, USER_ERRORS.USER_IS_ACTIVATED);
    }

    const confirmation =
      await this.userConfirmationService.findConfiramtion(confirmation_uuid);

    if (!confirmation) {
      return throwException(
        HttpStatus.NOT_FOUND,
        USER_CONFIRMATION_ERRORS.USER_CONFIRMATION_NOT_FOUND,
      );
    }

    const isConfirmationExpired =
      this.userConfirmationService.isConfirmationExpired(confirmation);

    if (!isConfirmationExpired) {
      await this.userConfirmationService.confirmUser(confirmUserInput);

      return 'Аккаунт успешно подтвержден';
    } else {
      const lastUserConfirmation =
        await this.userConfirmationService.findLastUserConfirmation(user_uuid);

      const result =
        await this.userConfirmationService.checkAndHandleUserConfirmation(
          user,
          lastUserConfirmation,
        );

      throwException(result.code, result.msg);
    }
  }
}
