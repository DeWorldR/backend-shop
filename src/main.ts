// src/main.ts 

import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';



async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // เปิดใช้ ValidationPipe 

  app.useGlobalPipes(new ValidationPipe({

    whitelist: true, 

    forbidNonWhitelisted: true 

  }));



  await app.listen(3000);

}

bootstrap(); 