import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserOne(userSn: number) {
    return this.prisma.user.findUnique({ where: { userSn } });
  }

  async registUser(name: string, nickName: string, imageUrl: string) {
    this.prisma.user.create({ data: { name, nickName, imageUrl } });
  }
}
