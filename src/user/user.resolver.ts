import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { NotFoundException } from '@exceptions/gql-exceptions-shortcuts';
import USER_ERRORS from './constants/errors';
import { ServiceError, throwException } from 'src/common/utils/throw-exception';
import { GqlResponse } from 'src/common/types';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => UserDto)
  async user(
    @Args('uuid', { type: () => String }) uuid: string,
  ): Promise<GqlResponse<UserDto>> {
    const userResult = await this.userService.findActiveUserByUnique({
      uuid,
    });

    if (userResult instanceof ServiceError) {
      return throwException(userResult.code, userResult.msg);
    }

    return userResult;
  }
}
