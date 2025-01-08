import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { MockUserService } from './__mocks__/user.service.mock.spec';
import { UserService } from './user.service';
import { userMock } from '@src/prisma/__mocks__/prisma.model.user.spec';
import { ServiceError } from '@src/common/utils/throw-exception';

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
    it('Получение юзера по uuid', async () => {
      const userUuidProps = {
        uuid: userMock.uuid,
      };

      const user = await mockUserService.findUserByUnique(userUuidProps);

      expect(user).toEqual(userMock);
      expect(mockUserService.findUserByUnique).toHaveBeenCalledWith(
        userUuidProps,
      );
    });

    it('Получение ошибки, если юзер не найден', async () => {
      const userUuidProps = {
        uuid: 'wrong-uuid',
      };

      const user = await mockUserService.findUserByUnique(userUuidProps);
      expect(user).toBeInstanceOf(ServiceError);
    });
  });
});
