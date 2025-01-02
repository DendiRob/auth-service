import { User } from '@prisma/client';
import {
  TCreateUser,
  TUniqueUserFields,
  TUserUpdate,
} from '@src/user/types/user.service.types';

export const userMock = {
  id: 1,
  uuid: 'b59b8c8d-d9c5-4b7f-8c69-15cc7bb292d5',
  created_at: new Date(),
  email: 'testuser@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  is_deleted: false,
  is_activated: true,
  Session: [],
  UserConfirmation: [],
  ForgottenPassword: [],
};

export class MockPrismaService {
  user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  constructor() {
    this.user.findUnique.mockImplementation(({ where }) => {
      if (
        (where && where.uuid === 'b59b8c8d-d9c5-4b7f-8c69-15cc7bb292d5') ||
        where.email === 'testuser@example.com'
      ) {
        return userMock;
      }
      return null;
    });

    this.user.create.mockImplementation(
      ({ data }: { data: TCreateUser }): User => {
        return {
          uuid: 'createduuid',
          id: 2,
          created_at: '2025-01-02T10:03:13.860Z' as unknown as Date,
          is_deleted: false,
          is_activated: false,
          name: data.name as string | null,
          password: data.password,
          email: data.email,
        };
      },
    );

    this.user.update.mockImplementation(
      ({
        where,
        data,
      }: {
        where: TUniqueUserFields;
        data: Partial<TUserUpdate>;
      }): User => {
        if (
          where &&
          (where.uuid === userMock.uuid || where.email === userMock.email)
        ) {
          return { ...userMock, ...data };
        }
        throw new Error('RecordNotFound');
      },
    );
  }
}
