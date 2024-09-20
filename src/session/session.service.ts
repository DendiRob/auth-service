import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createSessionInput } from './inputs/createSession.input';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}
  async createSession(sessionInfo: createSessionInput) {
    return await this.prisma.session.create({ data: sessionInfo });
  }
}
