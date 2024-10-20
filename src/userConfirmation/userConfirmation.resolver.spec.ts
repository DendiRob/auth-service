import { Test, TestingModule } from '@nestjs/testing';
import { UserConfirmationResolver } from './userConfirmation.resolver';

describe('UserConfirmationResolver', () => {
  let resolver: UserConfirmationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserConfirmationResolver],
    }).compile();

    resolver = module.get<UserConfirmationResolver>(UserConfirmationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
