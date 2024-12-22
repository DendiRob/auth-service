import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';

const changePasswordInputSchema = z.object({
  oldPassword: z
    .string()
    .min(5, { message: 'Минимальное количество символов: 5' }),
  newPassword: z
    .string()
    .min(5, { message: 'Минимальное количество символов: 5' }),
});

@ZodSchema(changePasswordInputSchema)
@InputType()
export class ChangePasswordInput {
  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;
}
