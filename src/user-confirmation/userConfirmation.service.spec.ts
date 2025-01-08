import { Test, TestingModule } from '@nestjs/testing';
import { UserConfirmationService } from './userConfirmation.service';
import { PrismaService } from '@src/prisma/prisma.service';
import {
  MockPrismaUserConfirmation,
  userConfirmationMock,
} from '@src/prisma/__mocks__/prisma.model.userConfiramtion.spec';
import { UserService } from '@src/user/user.service';
import { MockUserService } from '@src/user/__mocks__/user.service.mock.spec';
import { MailService } from '@src/mail/mail.service';
import { MockMailService } from '@src/mail/__mocks__/mail.service.mock.spec';
import { userMock } from '@src/prisma/__mocks__/prisma.model.user.spec';
import { ServiceError } from '@src/common/utils/throw-exception';
import { HttpStatus } from '@nestjs/common';
import USER_CONFIRMATION_ERRORS from './constants/errors';

describe('UserConfirmationService', () => {
  let service: UserConfirmationService;
  let prismaServiceMock: jest.Mocked<PrismaService>;
  let userServiceMock: jest.Mocked<UserService>;
  let mailServiceMock: jest.Mocked<MailService>;

  const createConfirmationMock = (expiresInMinutes: number) => ({
    id: 1,
    uuid: 'b34b8c8d-d9c5-4b7f-8c69-15cc7bb292d5',
    user_uuid: 'b3118c8d-d9c5-4b7f-8c69-15cc7bb292d5',
    expires_at: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    created_at: new Date('2025-01-01T00:00:00Z'),
    is_confirmed: false,
  });

  beforeEach(async () => {
    prismaServiceMock =
      new MockPrismaUserConfirmation() as unknown as jest.Mocked<PrismaService>;

    userServiceMock =
      new MockUserService() as unknown as jest.Mocked<UserService>;

    mailServiceMock =
      new MockMailService() as unknown as jest.Mocked<MailService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserConfirmationService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MailService, useValue: mailServiceMock },
      ],
    }).compile();

    service = module.get<UserConfirmationService>(UserConfirmationService);
  });

  it('сервис подтверждения аккаунта юзера должен существовать', () => {
    expect(service).toBeDefined();
  });

  it('должен создать подтверждение аккаунта', async () => {
    const confirmation = await service.createConfirmation(userMock.uuid);

    expect(confirmation).toBeDefined();

    expect(confirmation.created_at < confirmation.expires_at).toBe(true);
  });

  it('должен создать подтверждение аккаунта и отправить письмо на почту', async () => {
    const { email, uuid } = userMock;
    const createdConfirmation = jest
      .spyOn(service, 'createConfirmation')
      .mockResolvedValue(userConfirmationMock);

    const confirmation = await service.createConfirmationAndSendEmail({
      email: userMock.email,
      uuid: userMock.uuid,
    });

    expect(confirmation).toBeDefined();
    expect(mailServiceMock.sendAuthConfirmation).toHaveBeenCalledWith({
      to: email,
      user_uuid: uuid,
      confirmationUuid: confirmation.uuid,
    });

    expect(createdConfirmation).toHaveBeenCalled();
  });

  it('должен обновить запись сессии подтверждения аккаунта юзера', async () => {
    const result = await service.updateUserConfirmation(
      userConfirmationMock.uuid,
      { is_confirmed: true },
    );

    expect(result.is_confirmed).toBeTruthy();
    expect(prismaServiceMock.userConfirmation.update).toHaveBeenCalledWith({
      where: { uuid: userConfirmationMock.uuid },
      data: { is_confirmed: true },
    });
  });

  it('должен подтвердить аккаунт', async () => {
    expect(userMock.is_activated).toBeFalsy();

    const mockTransaction = jest.spyOn(prismaServiceMock, '$transaction');

    const input = {
      user_uuid: userMock.uuid,
      confirmation_uuid: userConfirmationMock.uuid,
    };

    const result = await service.confirmUser(input);

    expect(result.is_activated).toBeTruthy();

    expect(mockTransaction).toHaveBeenCalled();

    const transactionCallback = mockTransaction.mock.calls[0][0];
    expect(transactionCallback).toBeInstanceOf(Function);

    expect(prismaServiceMock.userConfirmation.update).toHaveBeenCalledWith({
      where: { uuid: input.confirmation_uuid },
      data: { is_confirmed: true },
    });

    expect(userServiceMock.updateUser).toHaveBeenCalledWith(
      { uuid: input.user_uuid },
      { is_activated: true },
      expect.anything(),
    );
  });

  it('Должен найти сессию подтверждения аккаунта по uuid-сессии', async () => {
    const confirmation = await service.findConfiramtion(
      userConfirmationMock.uuid,
    );

    expect(confirmation).toEqual(userConfirmationMock);
  });

  it('Должен найти последнюю сессию подтверждения аккаунта юзера по его uuid', async () => {
    const confirmation = await service.findLastUserConfirmation(
      userConfirmationMock.user_uuid,
    );

    expect(confirmation).toEqual(userConfirmationMock);
    expect(prismaServiceMock.userConfirmation.findFirst).toHaveBeenCalledWith({
      where: {
        user_uuid: userConfirmationMock.user_uuid,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  });

  it('Должен проверить срок действия сессии подтверждения аккаунта', () => {
    const expiredConfirmation = service.isConfirmationExpired(
      createConfirmationMock(-10),
    );

    const npExpiredConfirmation = service.isConfirmationExpired(
      createConfirmationMock(10),
    );

    expect(expiredConfirmation).toBeTruthy();
    expect(npExpiredConfirmation).toBeFalsy();
  });

  describe('Возвращении ошибки не подтвержденного аккаунта', () => {
    it('Должен вернуть ошибку о том, что аккаунт не подтвержден и новое подтверждение отправлено на почту', async () => {
      jest.spyOn(service, 'findLastUserConfirmation').mockResolvedValue(null);

      jest.spyOn(service, 'isConfirmationExpired').mockReturnValue(true);
      jest.spyOn(service, 'createConfirmationAndSendEmail');

      const serviceError = await service.userIsNotActivatedProccess(userMock);

      expect(service.findLastUserConfirmation).toHaveBeenCalledWith(
        userMock.uuid,
      );

      expect(service.isConfirmationExpired).not.toHaveBeenCalled();

      expect(service.createConfirmationAndSendEmail).toHaveBeenCalledWith(
        userMock,
      );

      expect(serviceError).toEqual(
        new ServiceError(
          HttpStatus.BAD_REQUEST,
          USER_CONFIRMATION_ERRORS.CONFIRMATION_SENT,
        ),
      );
    });

    it('Должен вернуть ошибку о том, что аккаунт не подтвержден, и последнее подтверждение еще не истекло', async () => {
      const confirmationMock = createConfirmationMock(10);

      jest
        .spyOn(service, 'findLastUserConfirmation')
        .mockResolvedValue(confirmationMock);

      jest.spyOn(service, 'isConfirmationExpired').mockReturnValue(false);
      jest.spyOn(service, 'createConfirmationAndSendEmail');

      const serviceError = await service.userIsNotActivatedProccess(userMock);

      expect(service.findLastUserConfirmation).toHaveBeenCalledWith(
        userMock.uuid,
      );

      expect(service.isConfirmationExpired).toHaveBeenCalledWith(
        confirmationMock,
      );

      expect(service.createConfirmationAndSendEmail).not.toHaveBeenCalledWith(
        userMock,
      );

      expect(serviceError).toEqual(
        new ServiceError(
          HttpStatus.BAD_REQUEST,
          USER_CONFIRMATION_ERRORS.ACTIVE_CONFIRMATION,
        ),
      );
    });
  });
});
