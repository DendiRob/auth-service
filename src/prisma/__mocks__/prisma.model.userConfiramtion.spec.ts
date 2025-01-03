import { User, UserConfirmation } from '@prisma/client';
import { ConfirmUserInput } from '@src/user-confirmation/inputs/confirmUser.input';
import { userMock } from './prisma.model.user.spec';
import { TUpdateUserConfirmation } from '@src/user-confirmation/types/userConfirmation.service.types';
import { TMaybeTranaction } from '../types';

export const userConfirmationMock = {
  id: 1,
  uuid: 'b34b8c8d-d9c5-4b7f-8c69-15cc7bb292d5',
  user_uuid: 'b3118c8d-d9c5-4b7f-8c69-15cc7bb292d5',
  expires_at: new Date('2025-01-01T00:10:00Z'),
  created_at: new Date('2025-01-01T00:00:00Z'),
  is_confirmed: false,
  User: [],
};

type TCreateUserConfirmationMock = {
  data: {
    user_uuid: string;
    expires_at: Date;
  };
};

export class MockPrismaUserConfirmation {
  userConfirmation = {
    create: jest.fn(
      ({ data }: TCreateUserConfirmationMock): UserConfirmation => {
        return {
          ...userConfirmationMock,
          created_at: new Date(),
          ...data,
        };
      },
    ),
    update: jest.fn<
      Promise<UserConfirmation>,
      [
        data: {
          where: { uuid: string };
          data: TUpdateUserConfirmation;
        },
      ]
    >(async ({ where, data }) => {
      if (where.uuid && where.uuid === userConfirmationMock.uuid) {
        return { ...userConfirmationMock, ...data };
      }
      throw new Error('RecordNotFound');
    }),
    findUnique: jest.fn<
      Promise<UserConfirmation | null>,
      [data: { where: { uuid: string } }]
    >(async ({ where }) => {
      if (where && where.uuid === userConfirmationMock.uuid) {
        return userConfirmationMock;
      }
      return null;
    }),
  };

  $transaction = jest.fn(async (callback: (tx: any) => Promise<any>) => {
    const tx = {
      userConfirmation: this.userConfirmation,
    };
    return callback(tx);
  });
}
