import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';
import { passwordShema } from '../common-validation-schemas';

const changePasswordInputSchema = z
  .object({
    oldPassword: passwordShema,
    newPassword: passwordShema,
    repeatNewPassword: passwordShema,
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
