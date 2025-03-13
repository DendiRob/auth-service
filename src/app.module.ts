import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';

import { UserModule } from './user/user.module';
import { AuthModule } from '@src/authorization/auth/auth.module';
import { SessionModule } from './authorization/session/session.module';
import { PrismaModule } from './prisma/prisma.module';

import graphqlConfig from './common/configs/graphql.config';
import mainConfig from './common/configs/main.config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { GqlAuthTokenGuard } from '@src/authorization/auth/strategies';
import { ZodValidation } from './common/pipes/zod-validation.pipe';
import { UserConfirmationModule } from './user-confirmation/userConfirmation.module';
import { ForgottenPasswordModule } from '@src/authorization/forgotten-password/forgottenPassword.module';
import { CaslModule } from './authorization/casl/casl.module';
import { CacheModule } from '@nestjs/cache-manager';
import { cacheManagerConfig } from './common/configs/cache-manager.config';
import { RolePermissionService } from './authorization/role-permission/rolePermission.service';
import { RolePermissionModule } from './authorization/role-permission/rolePermission.module';
import { DateScalar } from './common/scalars/Date.scalar';

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
    CacheModule.registerAsync(cacheManagerConfig),
    RolePermissionModule,
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
    RolePermissionService,
    DateScalar,
  ],
  controllers: [],
})
export class AppModule {}
