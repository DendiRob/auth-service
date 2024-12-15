import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { UserConfirmationService } from './userConfirmation.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { UserService } from 'src/user/user.service';
import { BadRequestException } from '@exceptions/gql-exceptions-shortcuts';
import USER_ERRORS from 'src/user/constants/errors';

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
      throw new BadRequestException(USER_ERRORS.USER_NOT_FOUND);
    }

    if (user.is_activated) {
      throw new BadRequestException(USER_ERRORS.USER_IS_ACTIVATED);
    }

    const confirmation =
      await this.userConfirmationService.findConfiramtion(confirmation_uuid);

    const isConfirmationValid =
      this.userConfirmationService.isConfirmationExpired(confirmation);

    if (isConfirmationValid) {
      await this.userConfirmationService.confirmUser(confirmUserInput);

      return 'Аккаунт успешно подтвержден';
    } else {
      await this.userConfirmationService.checkAndHandleUserConfirmation(
        user,
        confirmation,
      );
    }
  }
}
