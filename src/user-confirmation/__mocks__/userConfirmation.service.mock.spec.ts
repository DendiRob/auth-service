import { UserConfirmation } from '@prisma/client';
import { userConfirmationMock } from '@src/prisma/__mocks__/prisma.model.userConfiramtion.spec';
import { TCreateConfirmationAndSendEmail } from '../types/userConfirmation.service.types';

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

  isConfirmationExpired = jest.fn<Boolean, [confirmation: UserConfirmation]>(
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
}
