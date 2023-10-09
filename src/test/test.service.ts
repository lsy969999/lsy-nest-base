import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestService {
  constructor(private readonly prisma: PrismaService) {}

  async createTestParent(name: string) {
    return await this.prisma.test_Parent.create({
      data: {
        name,
      },
    });
  }
}
