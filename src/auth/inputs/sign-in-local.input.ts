import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';
import { passwordShema } from '../common-validation-schemas';

const signInLocalInputSchema = z.object({
  email: z.string().email({ message: 'Некорректный адрес электронной почты' }),
  password: passwordShema,
});

@ZodSchema(signInLocalInputSchema)
@InputType()
export class SignInLocalInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
