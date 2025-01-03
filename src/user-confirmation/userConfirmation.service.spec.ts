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
});
