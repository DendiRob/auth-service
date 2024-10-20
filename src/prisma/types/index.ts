import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export type TMaybeTranaction = Prisma.TransactionClient | PrismaService;
