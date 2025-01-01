import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { render } from '@react-email/render';
import { MailerService } from '@nestjs-modules/mailer';
import UserConfirmationEmail from '@emails/user-confirmation-mail/UserConfirmationMail';
import ForgetPasswordMail from '@emails/forget-password-mail/ForgetPasswordMail';

jest.mock('@react-email/render', () => ({
  render: jest.fn().mockResolvedValue('<p>Email HTML</p>'),
}));

describe('MailService', () => {
  let service: MailService;
  let mailerServiceMock: jest.Mocked<MailerService>;

  const frontendDomain = 'http://example.com';
  const fromEmail = 'no-reply@example.com';
  const emailHtml = '<p>Email HTML</p>';
  const userEmail = 'test@example.com';

  beforeEach(async () => {
    process.env.FRONTEND_DOMAIN = frontendDomain;
    process.env.MAIL_USER = fromEmail;

    mailerServiceMock = {
      sendMail: jest.fn().mockResolvedValue('Email sent successfully'),
    } as unknown as jest.Mocked<MailerService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mailerServiceMock,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    (render as jest.Mock).mockResolvedValue(emailHtml);
  });

  it('Сервис почты должен существовать', () => {
    expect(service).toBeDefined();
  });

  it('должен отправить email с правильными параметрами', async () => {
    const emailOptions = {
      to: userEmail,
      subject: 'Test Subject',
      text: 'Test Text',
    };

    const result = await service.sendEmail(emailOptions);

    expect(mailerServiceMock.sendMail).toHaveBeenCalledTimes(1);
    expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(emailOptions);
    expect(result).toBe('Email sent successfully');
  });

  it('должен отправить письмо для подтверждения аккаунта', async () => {
    const mockEmailData = {
      user_uuid: '1234',
      confirmationUuid: '5678',
      to: userEmail,
    };

    await service.sendAuthConfirmation(mockEmailData);

    expect(render).toHaveBeenCalledWith(
      UserConfirmationEmail({
        confirmUrl: `${frontendDomain}/1234/5678`,
        email: userEmail,
        siteName: frontendDomain,
      }),
    );

    expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
      to: userEmail,
      from: fromEmail,
      subject: `Подтвердите свои аккаунт на ${frontendDomain}`,
      html: emailHtml,
    });
  });

  it('должен отправить письмо для смены пароля "Забыл пароль"', async () => {
    const mockData = {
      to: userEmail,
      forgottenPasswordUuid: 'forgottenPasswordUuid',
      accountName: 'testAccName',
    };

    await service.sendForgottenPasswordLink(mockData);

    expect(render).toHaveBeenCalledWith(
      ForgetPasswordMail({
        resetPasswordUrl: `${frontendDomain}/reset-password/${mockData.forgottenPasswordUuid}`,
        userNickname: userEmail,
        accountName: 'testAccName',
      }),
    );

    expect(mailerServiceMock.sendMail).toHaveBeenCalledWith({
      to: userEmail,
      from: fromEmail,
      subject: 'Запрос на сброс пароля',
      html: emailHtml,
    });
  });
});
