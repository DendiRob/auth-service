import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';
import { join } from 'path';

export default {
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  playground: true,
  debug: true,
  formatError: (err: GraphQLError) => {
    const { errors, code } = err?.extensions;
    return {
      message: err.message,
      code: code || 500,
      errors,
    };
  },
} as ApolloDriverConfig;
