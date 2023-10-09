import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as windstonDaily from 'winston-daily-rotate-file';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  //Logger setting
  //TODO: env loglevel
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('Nest', {
              prettyPrint: true,
              colors: true,
            }),
          ),
        }),
        new windstonDaily({
          level: 'debug',
          datePattern: 'YYYY-MM-DD',
          dirname: __dirname + '/../logs',
          filename: 'app.log.%DATE%',
          maxFiles: 30,
          zippedArchive: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike('Nest', {
              prettyPrint: true,
            }),
          ),
        }),
      ],
    }),
  });

  const configService = app.get(ConfigService);
  const port = configService.get('SERVER_PORT');
  const env = configService.get('ENV');

  if (env === 'prd') {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [configService.get('DOC_USER')]: configService.get('DOC_PASS'),
        },
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('base example')
    .setDescription('The base API description')
    .setVersion('1.0')
    .addTag('base')
    .addBearerAuth() //bearer
    .build();
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true, //bearer refresh persist
    },
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, customOptions);

  //global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer 적용
      transform: true,
    }),
  );

  //port setting
  await app.listen(port);

  Logger.log(`started, port: ${port}, env: ${env}`, 'MAIN');
}
bootstrap();
