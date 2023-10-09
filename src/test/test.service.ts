import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);
  constructor(private readonly prisma: PrismaService) {}

  async createTestParent(name: string) {
    return await this.prisma.test_Parent.create({
      data: {
        name,
      },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  cronTest() {
    this.logger.debug('cronTest');
  }
}
