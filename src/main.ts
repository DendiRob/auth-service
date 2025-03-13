import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 4321;
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://sportikapp.ru'
        : 'http://localhost:3000',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Authorization,Content-Type,X-Requested-With,Accept',
  });
  await app.listen(PORT, () => {
    console.log(`I am running on port: ${PORT}`);
  });
}
bootstrap();
