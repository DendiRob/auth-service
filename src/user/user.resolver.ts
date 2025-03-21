import { Args, Context, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { ServiceError, throwException } from '@utils/throw-exception';
import { AuthenticatedRequest, GqlResponse } from '@src/common/types';
import { TUniqueUserFields } from './types/user.service.types';
import { UniqueUserInput } from './inputs/get-user.input';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from './constants/errors';
import { AbilityFactory } from '@src/authorization/casl/casl-ability/casl-ability.factory';
import { subject } from '@casl/ability';
import { CaslActions } from '@prisma/client';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(
    private userService: UserService,
    private abilityFactory: AbilityFactory,
  ) {}

  @Query(() => UserDto)
  async user(
    @Args('uniqueField') uniqueField: UniqueUserInput,
    @Context('req') req: AuthenticatedRequest,
  ): Promise<GqlResponse<UserDto>> {
    if (!uniqueField || Object.keys(uniqueField).length === 0) {
      return throwException(HttpStatus.BAD_REQUEST, USER_ERRORS.USER_NOT_FOUND);
    }

    const userResult = await this.userService.findActiveUserByUnique(
      uniqueField as TUniqueUserFields,
    );

    this.abilityFactory.checkAbilities(req.user, [
      {
        action: CaslActions.read,
        subject: subject('User', userResult),
      },
    ]);

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    return userResult;
  }

  @Query(() => UserDto)
  async me(
    @Context('req') req: AuthenticatedRequest,
  ): Promise<GqlResponse<UserDto>> {
    const userResult = await this.userService.findActiveUserByUnique({
      uuid: req.user.sub,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    return userResult;
  }
}
