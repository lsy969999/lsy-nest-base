import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export default class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.prisma.account.findFirst({
      where: { email, password },
      select: { user: true },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const accessToken = await this.genAccessToken(
      user.user.userSn,
      user.user.role,
    );
    const refreshToken = await this.genRefreshToken(
      user.user.userSn,
      user.user.role,
    );
    return { accessToken, refreshToken };
  }

  signOut() {
    return 'singOut';
  }

  /**
   * 이메일 중복체크 프로바이더와 함께
   */
  // regist(
  //   email: string,
  //   password: string,
  //   provider: Provider,
  //   providerId: string,
  //   name: string,
  //   nickName: string,
  //   imgUrl: string,
  // ){}

  withdraw() {}

  genAccessToken(userSn: number, role: UserRole) {
    const payload = { sub: userSn, role: role };
    const option: JwtSignOptions = { expiresIn: '1d' };
    return this.jwtService.signAsync(payload, option);
  }

  genRefreshToken(userSn: number, role: UserRole) {
    const payload = { sub: userSn, role: role };
    const option: JwtSignOptions = { expiresIn: '30d' };
    return this.jwtService.signAsync(payload, option);
  }
}
