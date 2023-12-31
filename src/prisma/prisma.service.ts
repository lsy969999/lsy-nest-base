import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
//https://github.com/prisma/prisma/issues/11986
//on query 하려면 제너릭 줘야함;
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit, OnModuleDestroy
{
  constructor(@Inject(Logger) private readonly logger: LoggerService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
    this.$on('query', (event) => {
      this.logger.debug(event);
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
