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
import { RegistReuslt } from './types/service.types';

@Injectable()
export default class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 로그인
   */
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

  /**
   * 로그아웃
   */
  signOut() {
    return 'singOut';
  }

  /**
   * 회원가입
   * - (*1) 이메일과 프로바이더 유효성 체크
   * -      (*1-1) 중복시 Exception
   * - (*2) user 생성
   * - (*3) 계정 생성
   * - (*4) access, refresh 토큰 생성
   * - (*5) access, refresh 토큰 서버 저장
   * ---
   * @TODO errcode 정의
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
      //(*1-1)
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

  /**
   * 회원탈퇴
   */
  withdraw() {}

  /**
   * 액세스토큰 생성
   */
  genAccessToken(userSn: number, role: UserRole) {
    const payload = { sub: userSn, role: role };
    const option: JwtSignOptions = { expiresIn: '1d' };
    return this.jwtService.signAsync(payload, option);
  }
  /**
   * 리프레시토큰 생성
   */
  genRefreshToken(userSn: number, role: UserRole) {
    const payload = { sub: userSn, role: role };
    const option: JwtSignOptions = { expiresIn: '30d' };
    return this.jwtService.signAsync(payload, option);
  }
}
