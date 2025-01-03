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

describe('UserConfirmationService', () => {
  let service: UserConfirmationService;
  let prismaServiceMock: jest.Mocked<PrismaService>;
  let userServiceMock: jest.Mocked<UserService>;
  let mailServiceMock: jest.Mocked<MailService>;

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

  it('Должен найти сессию подтверждения аккаунта по его uuid', async () => {
    const confirmation = await service.findConfiramtion(
      userConfirmationMock.uuid,
    );

    expect(confirmation).toEqual(userConfirmationMock);
  });
});
