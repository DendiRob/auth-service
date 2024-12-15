import { PublicResolver } from '@decorators/public-resolver.decorator';
import { Mutation, Resolver } from '@nestjs/graphql';

@Resolver()
export class ForgottenPasswordResolver {
  @PublicResolver()
  @Mutation(() => String)
  async resetPassword() {}
}
