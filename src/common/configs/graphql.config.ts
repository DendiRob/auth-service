import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';
import { join } from 'path';

export default {
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  playground: process.env.NODE_ENV === 'development',
  debug: true,
  formatError: (err: GraphQLError) => {
    const { errors, code } = err?.extensions;
    return {
      ...err,
      message: err.message,
      code: code || 500,
      errors,
    };
  },
  context: ({ req, res }) => ({ req, res }),
} as ApolloDriverConfig;
