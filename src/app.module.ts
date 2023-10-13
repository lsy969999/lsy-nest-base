import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import databaseConfig from './config/database.config';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggerMiddleWare } from './common/middleware/logger.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { WsGateWayModule } from './ws-gate-way/ws-gate-way.module';
import { SseModule } from './sse/sse.module';
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
    AuthModule,
    UserModule,
    AccountModule,
    WsGateWayModule,
    SseModule,
  ],
  controllers: [UserController],
  providers: [Logger, UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleWare).forRoutes('*');
  }
}
