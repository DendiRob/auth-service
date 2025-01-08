import { Test, TestingModule } from '@nestjs/testing';
import { UserConfirmationResolver } from './userConfirmation.resolver';
import { MockUserService } from '@src/user/__mocks__/user.service.mock.spec';
import { UserService } from '@src/user/user.service';
import { MockUserConfirmationService } from './__mocks__/userConfirmation.service.mock.spec';
import { UserConfirmationService } from './userConfirmation.service';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from '@src/user/constants/errors';
import USER_CONFIRMATION_ERRORS from './constants/errors';
import { userConfirmationMock } from '@src/prisma/__mocks__/prisma.model.userConfiramtion.spec';
import { userMock } from '@src/prisma/__mocks__/prisma.model.user.spec';

// TODO: поработать с моками, это вообще невозможно поддерживать

describe('UserConfirmationResolver', () => {
  let resolver: UserConfirmationResolver;
  let mockUserService: MockUserService;
  let mockUserConfirmation: MockUserConfirmationService;

  beforeEach(async () => {
    mockUserService = new MockUserService();
    mockUserConfirmation = new MockUserConfirmationService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserConfirmationResolver,
        { provide: UserService, useValue: mockUserService },
        { provide: UserConfirmationService, useValue: mockUserConfirmation },
      ],
    }).compile();

    resolver = module.get<UserConfirmationResolver>(UserConfirmationResolver);
  });

  it('резолвер подтверждения аккаунта юзера должен существовать', () => {
    expect(resolver).toBeDefined();
  });

  describe('Подтверждение аккаунта юзера', () => {
    it('должен вернуть ошибку, если пользователь не найден', async () => {
      const input = { confirmation_uuid: 'uuid1', user_uuid: 'uuid2' };

      mockUserService.findActiveUserByUnique.mockResolvedValue(
        new ServiceError(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND),
      );

      await expect(resolver.confirmUser(input)).rejects.toThrow(
        USER_ERRORS.USER_NOT_FOUND,
      );

      expect(mockUserService.findActiveUserByUnique).toHaveBeenCalledWith({
        uuid: 'uuid2',
      });
    });

    it('должен вернуть ошибку, если аккаунт пользователя уже активирован', async () => {
      const input = {
        confirmation_uuid: 'uuid1',
        user_uuid: 'b59b8c8d-d9c5-4b7f-8c69-15cc7bb292d5',
      };

      const userMockLocal = {
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

      mockUserService.findActiveUserByUnique.mockResolvedValue(userMockLocal);

      await expect(resolver.confirmUser(input)).rejects.toThrow(
        USER_ERRORS.USER_IS_ACTIVATED,
      );

      expect(mockUserService.findActiveUserByUnique).toHaveBeenCalledWith({
        uuid: userMock.uuid,
      });
    });

    it('должен вернуть ошибку, если сессия подтверждения не найдена', async () => {
      const input = {
        confirmation_uuid: 'uuid1',
        user_uuid: userMock.uuid,
      };

      mockUserService.findActiveUserByUnique.mockResolvedValue(userMock);
      mockUserConfirmation.findConfiramtion.mockResolvedValue(null);

      await expect(resolver.confirmUser(input)).rejects.toThrow(
        USER_CONFIRMATION_ERRORS.USER_CONFIRMATION_NOT_FOUND,
      );
    });

    it('должен вернуть ошибку и запустить процесс отправки письма на почту юзера, если сессия подтверждения истекла', async () => {
      const input = {
        confirmation_uuid: userConfirmationMock.uuid,
        user_uuid: userMock.uuid,
      };

      mockUserService.findActiveUserByUnique.mockResolvedValue(userMock);
      mockUserConfirmation.findConfiramtion.mockResolvedValue(
        userConfirmationMock,
      );
      mockUserConfirmation.isConfirmationExpired.mockReturnValue(true);

      await expect(resolver.confirmUser(input)).rejects.toThrow(
        USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
      );

      expect(
        mockUserConfirmation.userIsNotActivatedProccess,
      ).toHaveBeenCalledWith(userMock);
    });

    it('должен подтвердить аккаунт юзера', async () => {
      const input = {
        confirmation_uuid: userConfirmationMock.uuid,
        user_uuid: userMock.uuid,
      };

      mockUserService.findActiveUserByUnique.mockResolvedValue(userMock);
      mockUserConfirmation.findConfiramtion.mockResolvedValue(
        userConfirmationMock,
      );
      mockUserConfirmation.isConfirmationExpired.mockReturnValue(false);

      expect(await resolver.confirmUser(input)).toBe(
        'Аккаунт успешно подтвержден',
      );
    });
  });
});
