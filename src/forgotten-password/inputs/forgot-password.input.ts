import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';

const forgotPasswordInputSchema = z.object({
  email: z.string().email({ message: 'Некорректный адрес электронной почты' }),
});

@ZodSchema(forgotPasswordInputSchema)
@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;
}
