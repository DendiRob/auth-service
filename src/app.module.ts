import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriverConfig } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

import graphqlConfig from './common/configs/graphql.config';
import mainConfig from './common/configs/main.config';

@Module({
  imports: [
    ConfigModule.forRoot(mainConfig),
    GraphQLModule.forRoot<ApolloDriverConfig>(graphqlConfig),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
