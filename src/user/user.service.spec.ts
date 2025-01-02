import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@src/prisma/prisma.service';
import {
  MockPrismaService,
  userMock,
} from '@src/prisma/__mocks__/prisma.mock.spec';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from './constants/errors';
import { TUserUpdate } from './types/user.service.types';

describe('UserService', () => {
  let service: UserService;
  let prismaServiceMock: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    prismaServiceMock =
      new MockPrismaService() as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('Сервис пользователей должен существовать', () => {
    expect(service).toBeDefined();
  });

  describe('Найти юзера по уникальному идентификатору', () => {
    it('должно найтип юзера по uuid', async () => {
      const result = await service.findUserByUnique({
        uuid: userMock.uuid,
      });
      expect(result).toEqual(userMock);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { uuid: userMock.uuid },
      });
    });

    it('должно найтип юзера по email', async () => {
      const result = await service.findUserByUnique({
        email: userMock.email,
      });
      expect(result).toEqual(userMock);
      expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: userMock.email },
      });
    });

    it('должно не найти юзера', async () => {
      const result = await service.findUserByUnique({
        uuid: 'no-valid-uuid',
      });
      expect(result).toBeNull();
    });
  });

  describe('Найти активного юзера (существует и не удален аккаунт) по уникальному идентификатору', () => {
    it('должно найтип юзера по uuid', async () => {
      const result = await service.findActiveUserByUnique({
        uuid: userMock.uuid,
      });
      expect(result).toEqual(userMock);
    });

    it('должен выкинуть ошибку о том, что такой пользоватль не найден ', async () => {
      const result = await service.findActiveUserByUnique({
        uuid: 'asdasd',
      });
      expect(result).toEqual(
        new ServiceError(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND),
      );
    });
  });

  describe('Создание юзера', () => {
    it('должен создать юзера ', async () => {
      const createUserData = {
        email: 'test@email.ru',
        password: 'password',
      };

      const createdUser = await service.createUser(createUserData);

      expect(createdUser).toEqual({
        uuid: 'createduuid',
        id: 2,
        created_at: '2025-01-02T10:03:13.860Z',
        is_deleted: false,
        is_activated: false,
        ...createUserData,
      });
    });
  });

  describe('Обновление юзера', () => {
    const updatedUserData: Partial<TUserUpdate> = {
      is_activated: true,
      name: 'newName',
    };

    it('должен обновить юзера ', async () => {
      const updatedUser = await service.updateUser(
        { email: userMock.email },
        updatedUserData,
      );

      expect(updatedUser).toEqual({ ...userMock, ...updatedUserData });
    });

    it('должен выкинуть ошибку при обновлении юзера, что такой записи не существует', async () => {
      await expect(
        service.updateUser({ email: 'not exist-email' }, updatedUserData),
      ).rejects.toThrow('RecordNotFound');
    });
  });
});
