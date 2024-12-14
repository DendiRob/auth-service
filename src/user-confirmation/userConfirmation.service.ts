import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TMaybeTranaction } from 'src/prisma/types';
import { UserService } from 'src/user/user.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { MailService } from 'src/mail/mail.service';
import type { User, UserConfirmation } from '@prisma/client';
import { BadRequestException } from '@exceptions/gql-exceptions-shortcuts';

@Injectable()
export class UserConfirmationService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  async createConfirmation(
    userUuid: string,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    const lifeTime = Number(process.env.CONFIRMATION_USER_LIFE);

    const expirationTime = new Date(new Date().getTime() + lifeTime);

    return await prisma.userConfirmation.create({
      data: {
        user_uuid: userUuid,
        expires_at: expirationTime,
      },
    });
  }

  async createConfirmationAndSendEmail(user: User) {
    const { email, uuid } = user;
    const confirmation = await this.createConfirmation(uuid);

    // TODO: добавить нормальный запрос на почту
    await this.mailService.sendAuthConfirmation({
      to: email,
      user_uuid: uuid,
      confirmationUuid: confirmation.uuid,
    });

    return confirmation;
  }

  async confirmUser(data: ConfirmUserInput) {
    const { user_uuid, confirmation_uuid } = data;

    return this.prisma.$transaction(async (tx) => {
      const user = this.userService.updateUser(
        user_uuid,
        { is_activated: true },
        tx,
      );

      await this.prisma.userConfirmation.update({
        where: { uuid: confirmation_uuid },
        data: { is_confirmed: true },
      });

      return user;
    });
  }

  async findConfiramtion(confirmationUuid: string) {
    return await this.prisma.userConfirmation.findUnique({
      where: { uuid: confirmationUuid },
    });
  }

  async findLastUserConfirmation(userUuid: string) {
    return await this.prisma.userConfirmation.findFirst({
      where: {
        user_uuid: userUuid,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async userConfirmationIsNotValid(user: User) {
    const { uuid } = user;
    const lastConfirmation = await this.findLastUserConfirmation(uuid);

    const isLastConfirmationActive = this.isConfirmationValid(lastConfirmation);

    if (isLastConfirmationActive) {
      throw new BadRequestException(
        'Вы можете запрашивать ссылку для активации аккаунта каждые 10 минут. Пожалуйста, проверьте наличие письма на вашей почте.',
      );
    } else {
      await this.createConfirmationAndSendEmail(user);

      throw new BadRequestException(
        'Данная ссылка не действительна, мы уже отправили вам на почту новую',
      );
    }
  }

  isConfirmationValid(confirmation: null | UserConfirmation) {
    return confirmation && new Date() < new Date(confirmation?.expires_at);
  }
}
