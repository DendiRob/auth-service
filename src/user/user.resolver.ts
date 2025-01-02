import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { ServiceError, throwException } from '@utils/throw-exception';
import { GqlResponse } from '@src/common/types';
import { TUniqueUserFields } from './types/user.service.types';
import { UniqueUserInput } from './inputs/get-user.input';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from './constants/errors';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserDto)
  async user(
    @Args('uniqueField') uniqueField: UniqueUserInput,
  ): Promise<GqlResponse<UserDto>> {
    if (!uniqueField || Object.entries(uniqueField).length === 0) {
      return throwException(HttpStatus.BAD_REQUEST, USER_ERRORS.USER_NOT_FOUND);
    }

    const userResult = await this.userService.findActiveUserByUnique(
      uniqueField as TUniqueUserFields,
    );

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    return userResult;
  }
}
