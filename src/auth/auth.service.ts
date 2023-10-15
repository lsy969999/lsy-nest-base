import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  Account,
  AccountProvider,
  AccountStatus,
  AccountToken,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegistReuslt } from './types/service.types';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

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
      include: {
        user: true,
      },
    });

    if (!account) {
      throw new NotFoundException();
    }
    if (!bcrypt.compare(password, account.password)) {
      throw new NotFoundException();
    }

    const accountToken = await this.accessTokenRolling(this.prisma, account);

    return {
      accessToken: accountToken.accessToken,
      userSn: account.user.userSn,
      nickName: account.user.nickName,
    };
  }

  /**
   * 로그아웃
   */
  async signOut(userSn: number) {
    await this.prisma.accountToken.updateMany({
      where: { account: { userSn } },
      data: { isDeleted: true },
    });
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

      const accountToken = await this.accessTokenRolling(tx, account);

      return {
        userSn: user.userSn,
        accessToken: accountToken.accessToken,
        refreshToken: accountToken.refreshToken,
        nickName: user.nickName,
      };
    });

    return result;
  }

  /**
   * 회원탈퇴
   */
  async withdraw(userSn: number) {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userSn },
        data: { isDeleted: true },
      });
      await tx.account.updateMany({
        where: { userSn },
        data: { accountStatus: AccountStatus.WITHDRAW, isDeleted: true },
      });
      await tx.accountToken.updateMany({
        where: { account: { userSn } },
        data: { isDeleted: true },
      });
    });
  }

  async refresh(accessToken: string): Promise<{ accessToken: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const at = await tx.accountToken.findFirst({
        where: { accessToken, isDeleted: false },
        include: {
          account: {
            include: {
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

      const newAccountToken = await this.accessTokenRolling(tx, at.account);
      return { accessToken: newAccountToken.accessToken };
    });
    return result;
  }

  async getRole(userSn: number): Promise<UserRole> {
    const user = await this.prisma.user.findUnique({ where: { userSn } });
    return user.role;
  }

  /**
   * jwt 생성
   */
  genJwtToken(userSn: number, jti: string, expiresIn: number) {
    const payload = { sub: userSn, jti };
    const option: JwtSignOptions = { expiresIn };
    return this.jwtService.signAsync(payload, option);
  }

  genJti(): string {
    return uuidv4();
  }

  clearAccessCookieToClient(response: Response) {
    const cookieName = this.configService.get('jwt.cookieName');
    response.clearCookie(cookieName);
  }

  setAccessCookieToClient(response: Response, accessToken: string) {
    const cookieName = this.configService.get('jwt.cookieName');
    const thirtyDaysInMilliseconds = this.configService.get('jwt.cookieExp'); // 30일을 밀리초로 변환
    const expirationDate = new Date(Date.now() + thirtyDaysInMilliseconds);
    response.cookie(cookieName, accessToken, {
      httpOnly: true,
      path: '/',
      expires: expirationDate,
    });
  }

  private async accessTokenRolling(
    psm: Prisma.TransactionClient,
    account: Account,
  ): Promise<AccountToken> {
    const accessTokenJti = this.genJti();
    const refreshTokenJti = this.genJti();

    const accessTokenExpires = this.configService.get('jwt.accessTokenExp');
    const refrshTokenExpires = this.configService.get('jwt.refreshTokenExp');

    const newAccessToken = await this.genJwtToken(
      account.userSn,
      accessTokenJti,
      accessTokenExpires,
    );
    const newRefreshToken = await this.genJwtToken(
      account.userSn,
      refreshTokenJti,
      refrshTokenExpires,
    );

    const nowTimeNum = Date.now();

    const accountToken = await psm.accountToken.create({
      data: {
        accountSn: account.accountSn,
        accessExpires: new Date(nowTimeNum + accessTokenExpires),
        refreshExpires: new Date(nowTimeNum + refrshTokenExpires),
        accessJti: accessTokenJti,
        refreshJti: refreshTokenJti,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });

    return accountToken;
  }
}
