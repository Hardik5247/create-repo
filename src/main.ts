require('dotenv').config()

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { port } from './common/configuration'


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setBaseViewsDir(join(__dirname, '..', 'assets'));
  app.setViewEngine('hbs');
  await app.listen(port);
}
bootstrap();
