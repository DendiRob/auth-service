import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus,
} from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { ZodError, ZodSchema } from 'zod';
import { getZodSchema } from '../decorators/zod-schema.decorator';

@Injectable()
export class ZodValidation implements PipeTransform<any> {
  transform(value: unknown, { metatype }: ArgumentMetadata) {
    const schema: ZodSchema | undefined = getZodSchema(metatype);

    if (!schema) {
      return value;
    }

    try {
      schema.parse(value);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const errors = err.issues;

        const fromattedErrors = errors.map((i) => ({
          path: i.path,
          message: i.message,
        }));

        throw new GraphQLError(
          fromattedErrors[0].message ?? 'Ошибка при валидации данных',
          {
            extensions: {
              code: HttpStatus.BAD_REQUEST,
              errors: fromattedErrors,
            },
          },
        );
      }
    }
    return value;
  }
}
