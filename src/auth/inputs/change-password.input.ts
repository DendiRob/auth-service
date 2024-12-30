import { Field, InputType } from '@nestjs/graphql';
import { ZodSchema } from '@decorators/zod-schema.decorator';
import { changePasswordInputSchema } from '../validation-schemas';

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
