import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WinstonModule, utilities } from 'nest-winston';
import * as winston from 'winston';
// import * as windstonDaily from 'winston-daily-rotate-file';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  //Logger setting
  //TODO: env loglevel
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
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
        // new windstonDaily({
        //   level: 'debug',
        //   datePattern: 'YYYY-MM-DD',
        //   dirname: __dirname + '/../logs',
        //   filename: 'app.log.%DATE%',
        //   maxFiles: 30,
        //   zippedArchive: true,
        //   format: winston.format.combine(
        //     winston.format.timestamp(),
        //     utilities.format.nestLike('Nest', {
        //       prettyPrint: true,
        //     }),
        //   ),
        // }),
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
  /* 
      none : 어떳 것도 허용하지 않음
    self : 현재 출처에서는 허용하지만 하위 도메인에서는 허용되지 않음
    unsafe-inline : 인라인 자바스크립트, 인라인 스타일을 허용
    unsafe-eval	: eval과 같은 텍스트 자바스크립트 메커니즘을 허용 
      */
  // 구글 API 도메인과 인라인 스크립트, eval 스크립트를 허용
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cspOptions = {
    directives: {
      // 헬멧 기본 옵션 가져오기
      ...helmet.contentSecurityPolicy.getDefaultDirectives(), // 기본 헬멧 설정 객체를 리턴하는 함수를 받아 전개 연산자로 삽입
      'script-src': [
        "'self'",
        '*.googleapis.com',
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://cdn.socket.io',
        // "'connect-src'",
        'https://accounts.google.com',
      ],
      // 다음과 카카오에서 이미지 소스를 허용
      'img-src': ["'self'", 'data:', '*.daumcdn.net', '*.kakaocdn.net'],
      // 소스에 https와 http 허용
      //'base-uri': ['/', 'http:'],
      'connect-src': ["'self'", 'https://accounts.google.com'],
    },
  };
  //helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, //TODO cspOptions
    }),
  );
  app.enableCors({
    origin: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //cookie
  app.use(cookieParser());
  //hbs view
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  //port setting
  await app.listen(port);

  Logger.log(`started, port: ${port}, env: ${env}`, 'MAIN');
}
bootstrap();
