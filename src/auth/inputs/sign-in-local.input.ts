import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';

const signInLocalInputSchema = z.object({
  email: z.string().email({ message: 'Некорректный адрес электронной почты' }),
  password: z
    .string()
    .min(5, { message: 'Минимальное количество символов: 5' }),
});

@ZodSchema(signInLocalInputSchema)
@InputType()
export class signInLocalInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
