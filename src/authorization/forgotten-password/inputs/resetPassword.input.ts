import { ZodSchema } from '@decorators/zod-schema.decorator';
import { Field, InputType } from '@nestjs/graphql';
import { passwordSсhema } from '@src/authorization/auth/validation-schemas';
import { z } from 'zod';

const resetPasswordInputSchema = z
  .object({
    forgottenPasswordSessionUuid: z
      .string()
      .min(1, { message: 'Необходимо указать forgottenPasswordSessionUuid' }),
    newPassword: passwordSсhema,
    repeatNewPassword: passwordSсhema,
  })
  .refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatNewPassword'],
  });

@ZodSchema(resetPasswordInputSchema)
@InputType()
export class ResetPassordInput {
  @Field()
  forgottenPasswordSessionUuid: string;

  @Field()
  newPassword: string;

  @Field()
  repeatNewPassword: string;
}
