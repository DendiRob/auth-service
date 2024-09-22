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
import { APP_GUARD } from '@nestjs/core';
import { GqlAuthTokenGuard } from './auth/strategies';

@Module({
  imports: [
    UserModule,
    AuthModule,
    SessionModule,
    PrismaModule,
    ConfigModule.forRoot(mainConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthTokenGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
