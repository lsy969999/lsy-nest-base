import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import databaseConfig from './config/database.config';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerMiddleWare } from './common/middleware/logger.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TestModule,
    HealthModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleWare).forRoutes('*');
  }
}
