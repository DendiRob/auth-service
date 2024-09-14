import { ApolloDriver } from '@nestjs/apollo';
import { GraphQLError } from 'graphql';
import { join } from 'path';

export default {
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  playground: true,
  debug: true,
  formatError: (err: GraphQLError) => ({
    message: err.message,
    code: err?.extensions?.code || 500,
  }),
};
