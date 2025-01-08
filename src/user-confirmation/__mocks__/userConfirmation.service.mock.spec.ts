import { User, UserConfirmation } from '@prisma/client';
import { userConfirmationMock } from '@src/prisma/__mocks__/prisma.model.userConfiramtion.spec';
import { TCreateConfirmationAndSendEmail } from '../types/userConfirmation.service.types';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_CONFIRMATION_ERRORS from '../constants/errors';
import { ConfirmUserInput } from '../inputs/confirmUser.input';
import { userMock } from '@src/prisma/__mocks__/prisma.model.user.spec';

export class MockUserConfirmationService {
  findLastUserConfirmation = jest.fn<
    Promise<UserConfirmation | null>,
    [userUuid: string]
  >(async (userUuid: string) => {
    if (userUuid === userConfirmationMock.user_uuid) {
      return userConfirmationMock;
    }
    return null;
  });

  findConfiramtion = jest.fn<
    Promise<UserConfirmation | null>,
    [userUuid: string]
  >(async (userUuid: string) => {
    if (userUuid === userConfirmationMock.user_uuid) {
      return userConfirmationMock;
    }
    return null;
  });

  confirmUser = jest.fn<Promise<User>, [data: ConfirmUserInput]>(
    async (data) => {
      if (data.user_uuid === userMock.uuid) {
        return { ...userMock, is_activated: true };
      }
      throw new Error('RecordNotFound');
    },
  );

  isConfirmationExpired = jest.fn<boolean, [confirmation: UserConfirmation]>(
    (confirmation) => {
      const now = new Date();
      const expirationTime = new Date(confirmation?.expires_at);

      return now > expirationTime;
    },
  );

  createConfirmationAndSendEmail = jest.fn<
    Promise<UserConfirmation>,
    [user: TCreateConfirmationAndSendEmail]
  >(async () => {
    return userConfirmationMock;
  });

  userIsNotActivatedProccess = jest.fn<Promise<ServiceError>, [User]>(
    async (user) => {
      const lastConfirmation = await this.findLastUserConfirmation(user.uuid);

      if (lastConfirmation) {
        const isConfirmationExpired =
          this.isConfirmationExpired(lastConfirmation);

        if (!isConfirmationExpired) {
          return new ServiceError(
            HttpStatus.BAD_REQUEST,
            USER_CONFIRMATION_ERRORS.ACTIVE_CONFIRMATION,
          );
        }
      }

      await this.createConfirmationAndSendEmail(user);

      return new ServiceError(
        HttpStatus.BAD_REQUEST,
        USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
      );
    },
  );
}
