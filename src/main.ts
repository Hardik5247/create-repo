require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { port } from './common/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  /** Sets the directory for views to be rendered */
  app.setBaseViewsDir(join(__dirname, '..', 'assets'));

  /** Sets the view engine as handlebars */
  app.setViewEngine('hbs');
  
  await app.listen(port);
}
bootstrap();
