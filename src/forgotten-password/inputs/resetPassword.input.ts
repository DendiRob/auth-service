import { ZodSchema } from '@decorators/zod-schema.decorator';
import { Field, InputType } from '@nestjs/graphql';
import { z } from 'zod';

const resetPasswordInputSchema = z
  .object({
    forgottenPasswordSessionUuid: z
      .string()
      .min(1, { message: 'Необходимо указать forgottenPasswordSessionUuid' }),
    newPassword: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
    reapeatNewPassword: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
  })
  .refine((data) => data.newPassword === data.reapeatNewPassword, {
    message: 'Пароли не совпадают',
    path: ['reapeatNewPassword'],
  });

@ZodSchema(resetPasswordInputSchema)
@InputType()
export class ResetPassordInput {
  @Field()
  forgottenPasswordSessionUuid: string;

  @Field()
  newPassword: string;

  @Field()
  reapeatNewPassword: string;
}
