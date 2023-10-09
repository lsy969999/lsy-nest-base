import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
import * as windstonDaily from 'winston-daily-rotate-file';
import { Logger } from '@nestjs/common';

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

  //api prefix setting
  app.setGlobalPrefix('api');

  //port setting
  const configService = app.get(ConfigService);
  const port = configService.get('SERVER_PORT');
  const env = configService.get('ENV');
  await app.listen(port);

  Logger.log(`started, port: ${port}, env: ${env}`, 'MAIN');
}
bootstrap();
