import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  async findUserById(id: number): Promise<User> {
    return (await {}) as Promise<User>;
  }
}
