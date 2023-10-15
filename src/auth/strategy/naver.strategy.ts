import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('auth.naverClientId'),
      clientSecret: configService.get('auth.naverSecretId'),
      callbackURL: configService.get('auth.naverCallbackUrl'),
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const user_email = profile._json.email;
    const user_nick = profile._json.nickname;
    const user_provider = profile.provider;
    console.log('naver');
    console.log('user_email', user_email);
    console.log('user_nick', user_nick);
    console.log('user_provider', user_provider);

    return {
      email: user_email,
    };
  }
}
