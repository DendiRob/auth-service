import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';

describe('TokenService', () => {
  let service: TokenService;
  let jwtServiceMock: jest.Mocked<JwtService>;

  const userUuid = 'user-uuid';
  const email = 'test@example.com';

  beforeEach(async () => {
    process.env.ACCESS_TOKEN_LIFE = '3600';
    process.env.ACCESS_SECRET = 'mock-secret';

    jwtServiceMock = {
      signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
      decode: jest
        .fn()
        .mockReturnValue({ sub: 'user-uuid', email: 'test@example.com' }),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('Сервис токенов должен существовать', () => {
    expect(service).toBeDefined();
  });

  it('Должен отдать пару токенов', async () => {
    const result = await service.getTokens(userUuid, email);

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
      {
        sub: userUuid,
        email,
      },
      {
        expiresIn: Number(process.env.ACCESS_TOKEN_LIFE),
        secret: process.env.ACCESS_SECRET,
      },
    );

    expect(result).toEqual({
      access_token: 'mocked-jwt-token',
      refresh_token: 'mocked-jwt-token',
    });
  });

  it('должен декодировать токен', () => {
    const token = 'mocked-token';
    const decoded = service.decodeToken(token);

    expect(jwtServiceMock.decode).toHaveBeenCalledWith(token);
    expect(decoded).toEqual({ sub: 'user-uuid', email: 'test@example.com' });
  });
});
