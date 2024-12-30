import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { signInInputSchema } from '../validation-schemas';

@ZodSchema(signInInputSchema)
@InputType()
export class SignInInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
