import { z } from 'zod';

export const passwordSсhema = z
  .string()
  .min(5, { message: 'Минимальное количество символов: 5' });

export const changePasswordInputSchema = z
  .object({
    oldPassword: passwordSсhema,
    newPassword: passwordSсhema,
    repeatNewPassword: passwordSсhema,
  })
  .refine((data) => data.newPassword === data.repeatNewPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatNewPassword'],
  });

export const signUpLocalInputSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Необходимо указать email' })
      .email({ message: 'Некорректный адрес электронной почты' }),
    name: z.string().optional(),
    password: passwordSсhema,
    repeatedPassword: passwordSсhema,
  })
  .refine((data) => data.password === data.repeatedPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatedPassword'],
  });

export const signInInputSchema = z.object({
  email: z.string().email({ message: 'Некорректный адрес электронной почты' }),
  password: passwordSсhema,
});
