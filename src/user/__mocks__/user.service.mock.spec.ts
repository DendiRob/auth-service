import { User } from '@prisma/client';
import type { TUniqueUserFields } from '../types/user.service.types';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from '../constants/errors';
import { userMock } from '@src/prisma/__mocks__/prisma.mock-user.spec';

export class MockUserService {
  findUserByUnique = jest.fn<Promise<User | ServiceError>, [TUniqueUserFields]>(
    async (uniqueField) => {
      if (
        uniqueField.email === userMock.email ||
        uniqueField.uuid === userMock.uuid
      ) {
        return userMock;
      }
      return new ServiceError(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND);
    },
  );
}
