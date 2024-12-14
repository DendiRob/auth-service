import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PublicResolver } from '@decorators/public-resolver.decorator';
import { UserConfirmationService } from './userConfirmation.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { UserService } from 'src/user/user.service';
import { BadRequestException } from '@exceptions/gql-exceptions-shortcuts';

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
      throw new BadRequestException('Аккаунт пользователя не найден');
    }

    if (user.is_activated) {
      throw new BadRequestException('Аккаунт пользователя уже подтвержден');
    }

    const confirmation =
      await this.userConfirmationService.findConfiramtion(confirmation_uuid);

    const isConfirmationValid =
      this.userConfirmationService.isConfirmationValid(confirmation);

    if (isConfirmationValid) {
      await this.userConfirmationService.confirmUser(confirmUserInput);
      return 'Аккаунт успешно подтвержден';
    } else {
      await this.userConfirmationService.userConfirmationIsNotValid(user);
    }
  }
}
