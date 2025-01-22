import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from './casl-ability.factory';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CHECK_ABILITY, TRequiredRule } from './casl-ability.decorator';
import { ForbiddenError, subject } from '@casl/ability';
import { throwException } from '@src/common/utils/throw-exception';
import { IS_PUBLIC_KEY } from '@decorators/public-resolver.decorator';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) return true;

    const rules =
      this.reflector.get<TRequiredRule[]>(
        CHECK_ABILITY,
        context.getHandler(),
      ) || [];

    const req = ctx.getContext().req;
    const ability = this.abilityFactory.defineAbilityFor(req.user);

    try {
      ForbiddenError.setDefaultMessage('Доступ закрыт');
      rules.forEach((rule) =>
        ForbiddenError.from(ability).throwUnlessCan(
          rule.action,
          subject(rule.subject as string, req.user),
        ),
      );
      return true;
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw throwException(HttpStatus.FORBIDDEN, error.message);
      }
      return false;
    }
  }
}
