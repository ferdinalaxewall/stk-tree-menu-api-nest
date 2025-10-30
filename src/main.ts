import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    app.setGlobalPrefix('api');

    const config = new DocumentBuilder()
        .setTitle('STK Tree Menu API')
        .setDescription('The STK Tree Menu API description')
        .setVersion('1.0')
        .addTag('stk-api')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(process.env.APP_PORT || 4000);
}

bootstrap();
