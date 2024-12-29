import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// TODO: необходимо реализовать permissions/roles

async function bootstrap() {
  const PORT = process.env.PORT || 4321;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
}
bootstrap();
