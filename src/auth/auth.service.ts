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
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const bcryptSaltRounds = 10;

@Injectable()
export default class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * email Signin
   * ---
   * @TODO errcode 정의
   * @TODO ip?
   */
  async signIn(email: string, password: string) {
    const account = await this.prisma.account.findFirst({
      where: { email, provider: AccountProvider.EMAIL, isDeleted: false },
      select: { user: true, password: true, accountSn: true },
    });

    if (!account) {
      throw new NotFoundException();
    }
    if (!bcrypt.compare(password, account.password)) {
      throw new NotFoundException();
    }

    const accessTokenJti = this.genJti();
    const refreshTokenJti = this.genJti();

    const accessTokenExpires = 24 * 60 * 60 * 1000;
    const refershTokenExpires = 30 * 24 * 60 * 60 * 1000;

    //(*3)
    const accessToken = await this.genJwtToken(
      account.user.userSn,
      account.user.role,
      accessTokenJti,
      accessTokenExpires,
    );
    const refreshToken = await this.genJwtToken(
      account.user.userSn,
      account.user.role,
      refreshTokenJti,
      refershTokenExpires,
    );

    const nowTimeNum = Date.now();

    //(*4)
    await this.prisma.accountToken.create({
      data: {
        accountSn: account.accountSn,
        accessExpires: new Date(nowTimeNum + accessTokenExpires),
        refreshExpires: new Date(nowTimeNum + refershTokenExpires),
        accessJti: accessTokenJti,
        refreshJti: refreshTokenJti,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
    return { accessToken };
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
    const result = await this.prisma.$transaction<RegistReuslt>(async (tx) => {
      //(*1)
      const accountCount = await tx.account.count({
        where: { AND: [{ email }, { provider }, { isDeleted: false }] },
      });
      //(*1-1)
      if (accountCount) {
        throw new InternalServerErrorException();
      }

      const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds);

      //(*2)
      const user = await tx.user.create({
        data: { name, nickName, imageUrl, role: UserRole.USER },
      });
      const account = await tx.account.create({
        data: {
          email,
          password: hashedPassword,
          accountStatus: AccountStatus.NORMAL,
          userSn: user.userSn,
          provider,
          providerId,
        },
      });

      const accessTokenJti = this.genJti();
      const refreshTokenJti = this.genJti();

      const accessTokenExpires = 24 * 60 * 60 * 1000;
      const refershTokenExpires = 30 * 24 * 60 * 60 * 1000;

      //(*3)
      const accessToken = await this.genJwtToken(
        user.userSn,
        user.role,
        accessTokenJti,
        accessTokenExpires,
      );
      const refreshToken = await this.genJwtToken(
        user.userSn,
        user.role,
        refreshTokenJti,
        refershTokenExpires,
      );

      const nowTimeNum = Date.now();

      //(*4)
      await tx.accountToken.create({
        data: {
          accountSn: account.accountSn,
          accessExpires: new Date(nowTimeNum + accessTokenExpires),
          refreshExpires: new Date(nowTimeNum + refershTokenExpires),
          accessJti: accessTokenJti,
          refreshJti: refreshTokenJti,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
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

  async refresh(accessToken: string): Promise<{ accessToken: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const at = await tx.accountToken.findFirst({
        where: { accessToken, isDeleted: false },
        include: {
          account: {
            select: {
              accountSn: true,
              user: true,
            },
          },
        },
      });
      if (!at) {
        throw new NotFoundException();
      }
      const nowTime = Date.now();
      if (nowTime > at.refreshExpires.getTime()) {
        throw new InternalServerErrorException();
      }
      await tx.accountToken.update({
        where: { accountTokenSn: at.accountTokenSn },
        data: { isDeleted: true },
      });

      const newAccessTokenJti = this.genJti();
      const newRefreshTokenJti = this.genJti();

      const newAccessTokenExpires = 24 * 60 * 60 * 1000;
      const newRershTokenExpires = 30 * 24 * 60 * 60 * 1000;

      const newAccessToken = await this.genJwtToken(
        at.account.user.userSn,
        at.account.user.role,
        newAccessTokenJti,
        newAccessTokenExpires,
      );
      const newRefreshToken = await this.genJwtToken(
        at.account.user.userSn,
        at.account.user.role,
        newRefreshTokenJti,
        newRershTokenExpires,
      );

      const nowTimeNum = Date.now();

      await tx.accountToken.create({
        data: {
          accountSn: at.account.accountSn,
          accessExpires: new Date(nowTimeNum + newAccessTokenExpires),
          refreshExpires: new Date(nowTimeNum + newRershTokenExpires),
          accessJti: newAccessTokenJti,
          refreshJti: newRefreshTokenJti,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
      return { accessToken: newAccessToken };
    });
    return result;
  }

  /**
   * jwt 생성
   */
  genJwtToken(userSn: number, role: UserRole, jti: string, expiresIn: number) {
    const payload = { sub: userSn, role, jti };
    const option: JwtSignOptions = { expiresIn };
    return this.jwtService.signAsync(payload, option);
  }

  genJti(): string {
    return uuidv4();
  }
}
