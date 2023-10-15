import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('auth.kakaoClientId'),
      callbackURL: configService.get('auth.kakaoCallbackUrl'),
      clientSecret: configService.get('auth.kakaoSecretId'),
    });
  }

  async validate(accessToken, refreshToken, profile) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _raw, _json, ...profileRest } = profile;
    // const properties = _.mapKeys(_json.properties, (v, k) => {
    //   return _.camelCase(k);
    // });
    console.log('kakao');
    console.log('_raw', _raw);
    console.log('_json', _json);
    console.log('profileRest', profileRest);
    const email = _json.kakao_account.email;
    console.log('email', email);

    // const payload = {
    //   profile: profileRest,
    //   properties,
    //   token: {
    //     accessToken,
    //     refreshToken,
    //   },
    // };
    return { email };
  }
}
