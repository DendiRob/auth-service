import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { TMaybeTranaction } from '@src/prisma/types';
import { UserService } from '@src/user/user.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import { MailService } from '@src/mail/mail.service';
import USER_CONFIRMATION_ERRORS from './constants/errors';

import type { User, UserConfirmation } from '@prisma/client';
import { ServiceError } from '@src/common/utils/throw-exception';
import {
  TCreateConfirmationAndSendEmail,
  TUpdateUserConfirmation,
} from './types/userConfirmation.service.types';

@Injectable()
export class UserConfirmationService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  isConfirmationExpired(confirmation: UserConfirmation): boolean {
    const now = new Date();
    const expirationTime = new Date(confirmation?.expires_at);

    return now > expirationTime;
  }

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

  async updateUserConfirmation(
    uuid: string,
    data: TUpdateUserConfirmation,
    prisma: TMaybeTranaction = this.prisma,
  ) {
    return await prisma.userConfirmation.update({ where: { uuid }, data });
  }

  async createConfirmationAndSendEmail(user: TCreateConfirmationAndSendEmail) {
    const { email, uuid } = user;
    const confirmation = await this.createConfirmation(uuid);

    await this.mailService.sendAuthConfirmation({
      to: email,
      user_uuid: uuid,
      confirmationUuid: confirmation.uuid,
    });

    return confirmation;
  }

  async confirmUser(data: ConfirmUserInput): Promise<User> {
    const { user_uuid, confirmation_uuid } = data;

    return this.prisma.$transaction(async (tx) => {
      const user = this.userService.updateUser(
        { uuid: user_uuid },
        { is_activated: true },
        tx,
      );

      await this.updateUserConfirmation(
        confirmation_uuid,
        {
          is_confirmed: true,
        },
        tx,
      );

      return user;
    });
  }

  async findConfiramtion(confirmationUuid: string) {
    return await this.prisma.userConfirmation.findUnique({
      where: { uuid: confirmationUuid },
    });
  }

  async findLastUserConfirmation(
    userUuid: string,
  ): Promise<UserConfirmation | null> {
    return await this.prisma.userConfirmation.findFirst({
      where: {
        user_uuid: userUuid,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async userIsNotActivatedProccess(user: User): Promise<ServiceError> {
    const lastConfirmation = await this.findLastUserConfirmation(user.uuid);

    if (lastConfirmation) {
      const isConfirmationExpired =
        this.isConfirmationExpired(lastConfirmation);

      if (!isConfirmationExpired) {
        return new ServiceError(
          HttpStatus.BAD_REQUEST,
          USER_CONFIRMATION_ERRORS.ACTIVE_CONFIRMATION,
        );
      }
    }

    await this.createConfirmationAndSendEmail(user);

    return new ServiceError(
      HttpStatus.BAD_REQUEST,
      USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
    );
  }
}
