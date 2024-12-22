import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';
import { passwordShema } from '../common-validation-schemas';

const signUpLocalInputSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Необходимо указать email' })
      .email({ message: 'Некорректный адрес электронной почты' }),
    name: z.string().optional(),
    password: passwordShema,
    repeated_password: passwordShema,
  })
  .refine((data) => data.password === data.repeated_password, {
    message: 'Пароли не совпадают',
    path: ['repeated_password'],
  });

@ZodSchema(signUpLocalInputSchema)
@InputType()
export class SignUpLocalInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field()
  repeated_password: string;
}
