import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { HttpStatus } from '@nestjs/common';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { UserConfirmationService } from './userConfirmation.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { UserService } from 'src/user/user.service';
import USER_CONFIRMATION_ERRORS from './constants/errors';
import USER_ERRORS from 'src/user/constants/errors';
import { ServiceError, throwException } from 'src/common/utils/throw-exception';
import { GqlResponse } from 'src/common/types';

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
  ): Promise<GqlResponse<string>> {
    const { confirmation_uuid, user_uuid } = confirmUserInput;

    const userResult = await this.userService.findActiveUserByUnique({
      uuid: user_uuid,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    if (userResult.is_activated) {
      return throwException(
        HttpStatus.BAD_REQUEST,
        USER_ERRORS.USER_IS_ACTIVATED,
      );
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
      const result =
        await this.userConfirmationService.userIsNotActivatedProccess(
          userResult,
        );

      return throwException(result.code, result.msg);
    }
  }
}
