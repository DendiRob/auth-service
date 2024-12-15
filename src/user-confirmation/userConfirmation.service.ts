import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TMaybeTranaction } from 'src/prisma/types';
import { UserService } from 'src/user/user.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { MailService } from 'src/mail/mail.service';
import { BadRequestException } from '@exceptions/gql-exceptions-shortcuts';
import ERRORS from './constants/errors';

import type { User, UserConfirmation } from '@prisma/client';

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

  async checkAndHandleUserConfirmation(
    user: User,
    confirmation: UserConfirmation,
  ) {
    const isConfirmationActive = this.isConfirmationExpired(confirmation);

    if (isConfirmationActive) {
      throw new BadRequestException(ERRORS.ACTIVE_CONFIRMATION);
    }
    await this.createConfirmationAndSendEmail(user);

    throw new BadRequestException(ERRORS.CONFIRMATION_SENT);
  }

  isConfirmationExpired(confirmation: null | UserConfirmation) {
    const now = new Date();
    const expirationTime = new Date(confirmation?.expires_at);

    return confirmation && now < expirationTime;
  }
}
