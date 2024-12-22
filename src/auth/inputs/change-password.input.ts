import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';

const changePasswordInputSchema = z
  .object({
    oldPassword: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
    newPassword: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
    repeatNewPassword: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
  })
  .refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatNewPassword'],
  });

@ZodSchema(changePasswordInputSchema)
@InputType()
export class ChangePasswordInput {
  @Field()
  oldPassword: string;

  @Field()
  newPassword: string;

  @Field()
  repeatNewPassword: string;
}
