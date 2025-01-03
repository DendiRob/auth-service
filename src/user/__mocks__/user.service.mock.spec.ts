import { User } from '@prisma/client';
import type {
  TUniqueUserFields,
  TUserUpdate,
} from '../types/user.service.types';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from '../constants/errors';
import { userMock } from '@src/prisma/__mocks__/prisma.model.user.spec';
import { TMaybeTranaction } from '@src/prisma/types';

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

  updateUser = jest.fn<
    Promise<User>,
    [TUniqueUserFields, data: Partial<TUserUpdate>, tx: TMaybeTranaction]
  >(async (uniqueField, data, tx) => {
    if (
      userMock.email === uniqueField.email ||
      userMock.uuid === uniqueField.uuid
    ) {
      return {
        ...userMock,
        ...data,
      };
    }
    throw new Error('RecordNotFound');
  });
}
