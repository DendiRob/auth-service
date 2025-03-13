import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<Date, Date | null> {
  parseValue(value: string | number): Date {
    return new Date(value);
  }

  serialize(value: Date): Date {
    return new Date(value);
  }

  parseLiteral(ast: ValueNode): Date | null {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.value);
    }
    return null;
  }
}
