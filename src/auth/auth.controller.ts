import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import AuthService from './auth.service';
import { SignInReqDto } from './dto/req.dto';
import { SignInResDto } from './dto/res.dto';
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
  constructor(private readonly authService: AuthService) {}

  //이메일 로그인
  @Post('signIn')
  async signIn(@Body() data: SignInReqDto): Promise<SignInResDto> {
    return this.authService.signIn(data.email, data.password);
  }

  //이메일 로그아웃
  @Post('signOut')
  signOut() {
    return this.authService.signOut();
  }

  //가입
  @Post('regist')
  signUp() {
    return;
  }

  //탈퇴
  @Post('withdrawal')
  withdrawal() {
    return;
  }
}
