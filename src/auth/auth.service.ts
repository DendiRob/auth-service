import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionService } from 'src/session/session.service';
import { UserService } from 'src/user/user.service';
import { registrationInput } from './inputs/registration.input';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prisma: PrismaService,
    private sessionService: SessionService,
  ) {}

  async registrationUser(userInput: registrationInput) {
    const { repeatedPassword, ...userData } = userInput;
    // TODO тут открываем транзакцию
  }
}
