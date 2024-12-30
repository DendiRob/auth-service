import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { signUpLocalInputSchema } from '../validation-schemas';

@ZodSchema(signUpLocalInputSchema)
@InputType()
export class SignUpInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field()
  repeatedPassword: string;
}
