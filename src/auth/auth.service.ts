import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { AccountProvider, AccountStatus, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
type RegistReuslt = {
  userSn: number;
  accessToken: string;
  refreshToken: string;
  nickName: string;
};

@Injectable()
export default class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
   * TODO: errcode 정의
   * (*1) 이메일과 프로바이더 유효성 체크
   * (*2) user 생성
   * (*3) 계정 생성
   * (*4) access, refresh 토큰 생성
   * (*5) access, refresh 토큰 서버 저장
   */
  async regist(
    email: string,
    password: string,
    provider: AccountProvider,
    providerId: string,
    name: string,
    nickName: string,
    imageUrl: string,
  ): Promise<RegistReuslt> {
    const result = await this.prisma.$transaction(async (tx) => {
      //(*1)
      const accountCount = await tx.account.count({
        where: { AND: [{ email }, { provider }] },
      });
      if (accountCount) {
        throw new InternalServerErrorException();
      }

      //(*2)
      const user = await tx.user.create({
        data: { name, nickName, imageUrl, role: UserRole.USER },
      });
      const account = await tx.account.create({
        data: {
          email,
          password,
          accountStatus: AccountStatus.NORMAL,
          userSn: user.userSn,
          provider,
          providerId,
        },
      });
      //(*3)
      const accessToken = await this.genAccessToken(user.userSn, user.role);
      const refreshToken = await this.genRefreshToken(user.userSn, user.role);

      //(*4)
      await tx.accountRefreshToken.create({
        data: { token: refreshToken, accountSn: account.accountSn },
      });

      return {
        userSn: user.userSn,
        accessToken,
        refreshToken,
        nickName: user.nickName,
      };
    });

    return result;
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
