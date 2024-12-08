import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { z } from 'zod';

const signUpLocalInputSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Необходимо указать email' })
      .email({ message: 'Некорректный адрес электронной почты' }),
    name: z.string().optional(),
    password: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
    repeated_password: z
      .string()
      .min(5, { message: 'Минимальное количество символов: 5' }),
  })
  .refine((data) => data.password === data.repeated_password, {
    message: 'Пароли не совпадают',
    path: ['repeated_password'],
  });

@ZodSchema(signUpLocalInputSchema)
@InputType()
export class signUpLocalInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field()
  repeated_password: string;
}
