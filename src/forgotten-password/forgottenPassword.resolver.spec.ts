import { Test, TestingModule } from '@nestjs/testing';
import { ForgottenPasswordResolver } from './forgottenPassword.resolver';

describe('ForgottenPasswordResolver', () => {
  let resolver: ForgottenPasswordResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForgottenPasswordResolver],
    }).compile();

    resolver = module.get<ForgottenPasswordResolver>(ForgottenPasswordResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
