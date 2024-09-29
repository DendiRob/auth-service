import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TMaybeTranaction } from 'src/prisma/types';
import { UserService } from 'src/user/user.service';
import { ConfirmUserInput } from './inputs/confirmUser.input';
import type { UserConfirmation } from '@prisma/client';

@Injectable()
export class UserConfirmationService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
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

  async findLastConfirmation() {
    return await this.prisma.userConfirmation.findFirst({
      orderBy: {
        created_at: 'desc',
      },
    });
  }
  isConfirmationValid(confirmation: null | UserConfirmation) {
    return confirmation && new Date() < new Date(confirmation?.expires_at);
  }
}
