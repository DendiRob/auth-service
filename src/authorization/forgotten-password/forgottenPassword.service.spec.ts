import { Test, TestingModule } from '@nestjs/testing';
import { ForgottenPasswordService } from './forgottenPassword.service';

describe('ForgottenPasswordService', () => {
  let service: ForgottenPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForgottenPasswordService],
    }).compile();

    service = module.get<ForgottenPasswordService>(ForgottenPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
