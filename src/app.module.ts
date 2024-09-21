import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { PrismaModule } from './prisma/prisma.module';

import graphqlConfig from './common/configs/graphql.config';
import mainConfig from './common/configs/main.config';

@Module({
  imports: [
    ConfigModule.forRoot(mainConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    UserModule,
    AuthModule,
    SessionModule,
    PrismaModule,
  ],
  controllers: [],
})
export class AppModule {}
