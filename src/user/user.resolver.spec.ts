import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { MockUserService } from './__mocks__/user.service.mock.spec';
import { UserService } from './user.service';
import { userMock } from '@src/prisma/__mocks__/prisma.model.user.spec';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_ERRORS from './constants/errors';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let mockUserService: MockUserService;
  // TODO:переделать не тестирую резолвер(

  beforeEach(async () => {
    mockUserService = new MockUserService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('Резолвер пользоватлей должен существовать', () => {
    expect(resolver).toBeDefined();
  });

  describe('Получение юзера', () => {
    it('Должен отдать ошибку, что юзер не найден', async () => {
      const UniqueUserInput = {
        uuid: userMock.uuid,
      };
      mockUserService.findActiveUserByUnique.mockResolvedValue(
        new ServiceError(HttpStatus.NOT_FOUND, USER_ERRORS.USER_NOT_FOUND),
      );

      await expect(resolver.user(UniqueUserInput)).rejects.toThrow(
        USER_ERRORS.USER_NOT_FOUND,
      );
    });

    it('Должен вернуть юзера', async () => {
      const UniqueUserInput = {
        uuid: userMock.uuid,
      };
      mockUserService.findActiveUserByUnique.mockResolvedValue(userMock);
      const user = await resolver.user(UniqueUserInput);

      expect(user).toEqual(userMock);
    });
  });
});
