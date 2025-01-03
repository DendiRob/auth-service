import { TSendAuthConfirmation } from '../types/mail.service.types';

export class MockMailService {
  sendAuthConfirmation = jest.fn<Promise<void>, [TSendAuthConfirmation]>(
    async (data) => {},
  );
}
