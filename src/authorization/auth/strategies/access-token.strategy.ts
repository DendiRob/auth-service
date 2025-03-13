import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '@decorators/public-resolver.decorator';
import { TUserRequest } from '../types';
import { throwException } from 'src/common/utils/throw-exception';
import { UserService } from '@src/user/user.service';
import { RolePermissionService } from '@src/authorization/role-permission/rolePermission.service';
import { Permission } from '@prisma/client';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private userService: UserService,
    private rolePermissionService: RolePermissionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_SECRET!,
    });
  }

  async validate(payload: TUserRequest) {
    const user = await this.userService.findUserByUnique({ uuid: payload.sub });
    let permissions: Permission[] = [];
    if (user?.roleId) {
      const rolePermissions =
        await this.rolePermissionService.getPermissionsByRoleId(user?.roleId);
      permissions = rolePermissions.map((i) => {
        const conditions = i.Permission.conditions;
        return { ...i.Permission, conditions };
      });
    }

    return { ...payload, ...user, permissions };
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
