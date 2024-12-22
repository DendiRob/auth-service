import { ZodSchema } from '@decorators/zod-schema.decorator';
import { Field, InputType } from '@nestjs/graphql';
import { passwordShema } from 'src/auth/common-validation-schemas';
import { z } from 'zod';

const resetPasswordInputSchema = z
  .object({
    forgottenPasswordSessionUuid: z
      .string()
      .min(1, { message: 'Необходимо указать forgottenPasswordSessionUuid' }),
    newPassword: passwordShema,
    reapeatNewPassword: passwordShema,
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
