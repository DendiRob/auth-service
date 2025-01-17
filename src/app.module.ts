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
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { GqlAuthTokenGuard } from './auth/strategies';
import { ZodValidation } from './common/pipes/zod-validation.pipe';
import { UserConfirmationModule } from './user-confirmation/userConfirmation.module';
import { ForgottenPasswordModule } from './forgotten-password/forgottenPassword.module';
import { CaslModule } from './casl/casl.module';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheManagerConfig } from './common/configs/cache-manager.config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    SessionModule,
    PrismaModule,
    UserConfirmationModule,
    ConfigModule.forRoot(mainConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    ForgottenPasswordModule,
    CaslModule,
    CacheModule.register(cacheManagerConfig),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlAuthTokenGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidation,
    },
  ],
  controllers: [],
})
export class AppModule {}
