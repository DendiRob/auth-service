import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TCreateForgottenPassword,
  TCreateForgottenPasswordAndSendEmail,
} from './types/forgottenPassword.types';
import { MailService } from 'src/mail/mail.service';
import { ForgottenPassword } from '@prisma/client';

@Injectable()
export class ForgottenPasswordService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  isForgottenPasswordExpired(session: ForgottenPassword) {
    const now = new Date();
    const expirationTime = new Date(session.expires_at);

    return session && now > expirationTime;
  }

  async findLastForgottenPasword(userUuid: string) {
    return await this.prisma.forgottenPassword.findFirst({
      where: {
        user_uuid: userUuid,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async createForgottenPasswordSession(data: TCreateForgottenPassword) {
    const lifeTime = Number(process.env.FORGOTTEN_PASSWORD_SESSION_LIFE);

    const expirationTime = new Date(new Date().getTime() + lifeTime);

    return await this.prisma.forgottenPassword.create({
      data: {
        ...data,
        expires_at: expirationTime,
      },
    });
  }

  async createForgottenPasswordAndSendEmail(
    data: TCreateForgottenPasswordAndSendEmail,
  ) {
    const { email, ...createdSessionData } = data;
    const session =
      await this.createForgottenPasswordSession(createdSessionData);

    // TODO: добавить нормальный запрос на почту
    await this.mailService.sendForgottenPasswordLink({
      to: email,
      forgottenPasswordUuid: session.uuid,
    });

    return session;
  }
}
