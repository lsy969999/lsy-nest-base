import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async createTestParent(name: string) {
    return await this.prisma.test_Parent.create({
      data: {
        name,
      },
    });
  }

  async getTestParent() {
    const cached = await this.cacheManager.get('getTestParent');
    if (cached) {
      return cached;
    } else {
      const data = await this.prisma.test_Parent.findMany();
      await this.cacheManager.set('getTestParent', data, 1000 * 1);
      return data;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  cronTest() {
    this.logger.debug('cronTest');
  }
}
