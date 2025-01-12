import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@decorators/public-resolver.decorator';
import { TUserRequest } from '../types';
import { throwException } from 'src/common/utils/throw-exception';
import { Request } from 'express';
import { extractCookie } from '@src/common/utils/cookies';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          extractCookie(req, process.env.ACCESS_TOKEN_NAME as string),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_SECRET,
    });
  }

  async validate(payload: TUserRequest) {
    return payload;
  }
}

@Injectable()
export class GqlAuthTokenGuard extends AuthGuard('jwt-access') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return isPublic || super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(
    err: unknown,
    user: TUserRequest,
    info: unknown,
    context: ExecutionContext,
  ) {
    if (!user) {
      return throwException(
        HttpStatus.UNAUTHORIZED,
        'Пользователь не авторизован',
      );
    }

    return super.handleRequest(err, user, info, context);
  }
}
