import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PublicResolver } from 'src/common/decorators/publicResolver.decorator';
import { UserConfirmationService } from './userConfirmation.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';
import { BadRequestException } from '@exceptions/GqlExceptionsShortcuts';

@Resolver()
export class UserConfirmationResolver {
  constructor(
    private userConfirmationService: UserConfirmationService,
    private userService: UserService,
    private mailService: MailService,
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
      const lastConfirmation =
        await this.userConfirmationService.findLastConfirmation();

      const isLastConfirmationActive =
        this.userConfirmationService.isConfirmationValid(lastConfirmation);

      if (isLastConfirmationActive) {
        throw new BadRequestException(
          'Вы можете запрашивать ссылку для активации аккаунта каждые 10 минут. Пожалуйста, проверьте наличие письма на вашей почте.',
        );
      } else {
        const confirmation =
          await this.userConfirmationService.createConfirmation(user_uuid);
        // TODO: добавить нормальный запрос на почту
        // await this.mailService.sendMsg();
        throw new BadRequestException(
          'Данная ссылка не действительна, мы уже отправили вам на почту новую',
        );
      }
    }
  }
}
