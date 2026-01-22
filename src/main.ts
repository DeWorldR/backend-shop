// src/main.ts 
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // 1. เพิ่มตัวนี้
import { join } from 'path'; // 2. เพิ่มตัวนี้
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    forbidNonWhitelisted: true ,
    transform: true, 
    transformOptions: { enableImplicitConversion: true }, //ช่วยให้การแปลงชนิดข้อมูลพื้นฐานทำได้โดยอัตโนมัติ
  }));

  await app.listen(3000);
}
bootstrap();