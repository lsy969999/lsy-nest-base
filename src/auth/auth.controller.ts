import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import AuthService from './auth.service';
import {
  RefreshReqDto,
  RegistReqDto,
  SignInReqDto,
  SignOutReqDto,
  WithDrawReqDto,
} from './dto/req.dto';
import { RegistResDto, SignInResDto } from './dto/res.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
/*
사용자 인증에관한 진입점
인증은 jwt를 사용하며,
access, refresh 두개의 토큰을 운용한다.
jwt 스펙은 아래와 같다.
페이로드:
    sub: 사용자식별
    role: 사용자 권한
만료일:
    acc: 1d
    ref: 30d

이메일, 소셜, 로그인, 로그아웃, 가입, 탈퇴를 맡는다.
*/
@Controller('api/auth')
@ApiTags('Auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  //이메일 로그인
  @Post('signIn')
  async signIn(
    @Body() data: SignInReqDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SignInResDto> {
    const res = await this.authService.signIn(data.email, data.password);
    this.authService.setAccessCookieToClient(response, res.accessToken);
    return {
      nickName: res.nickName,
      userSn: res.userSn,
    };
  }

  //이메일 로그아웃
  @Post('signOut')
  async signOut(
    @Body() data: SignOutReqDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.clearAccessCookieToClient(response);
    await this.authService.signOut(1);
    return {};
  }

  //가입
  @Post('regist')
  async signUp(
    @Body()
    {
      email,
      password,
      imageUrl,
      name,
      nickName,
      provider,
      providerId,
    }: RegistReqDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RegistResDto> {
    const result = await this.authService.regist(
      email,
      password,
      provider,
      providerId,
      name,
      nickName,
      imageUrl,
    );
    this.authService.setAccessCookieToClient(response, result.accessToken);
    return {
      nickName: result.nickName,
      userSn: result.userSn,
    };
  }

  //탈퇴 TODO
  @Post('withdraw')
  async withdrawal(
    @Body() data: WithDrawReqDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.authService.clearAccessCookieToClient(response);
    await this.authService.withdraw(1);
    return {};
  }

  //재발급
  @Post('refresh')
  refresh(@Body() data: RefreshReqDto, @Req() request: any) {
    console.log(request.user);
    console.log(data);
    // return this.authService.refresh(data.accessToken);
  }
}
