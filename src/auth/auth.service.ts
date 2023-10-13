import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AccountProvider, AccountStatus, UserRole } from '@prisma/client';
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
   * TODO: Trx, DupCheck
   */
  async regist(
    email: string,
    password: string,
    provider: AccountProvider,
    providerId: string,
    name: string,
    nickName: string,
    imageUrl: string,
  ): Promise< {userSn: number, accessToken: string, refreshToken: string, nickName: string}>{
    const user = await this.prisma.user.create({data:{name, nickName, imageUrl, role: UserRole.USER, }})
    const account = await this.prisma.account.create({data:{email, password, accountStatus: AccountStatus.NORMAL, userSn: user.userSn, provider, providerId, }})
    const accessToken = await this.genAccessToken(
      user.userSn,
      user.role,
    );
    const refreshToken = await this.genRefreshToken(
      user.userSn,
      user.role,
    );
    this.prisma.accountRefreshToken.create({data:{token: refreshToken, accountSn: account.accountSn }})
    return {
      userSn: user.userSn,
      accessToken,
      refreshToken,
      nickName: user.nickName,
    }
  }

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
