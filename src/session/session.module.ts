import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [SessionService, PrismaService],
})
export class SessionModule {}
