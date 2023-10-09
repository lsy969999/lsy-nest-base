import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestModule } from './test/test.module';
import { HealthModule } from './health/health.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TestModule,
    HealthModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {}
