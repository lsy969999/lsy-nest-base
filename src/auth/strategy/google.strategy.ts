import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('auth.googleClientId'),
      clientSecret: configService.get('auth.googleSecretId'),
      callbackURL: configService.get('auth.googleCallbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // done: VerifyCallback,
  ) {
    // console.log('google');
    // console.log('accessToken', accessToken);
    // console.log('refreshToken', refreshToken);
    // console.log('profile', profile);
    // console.log(accessToken, refreshToken, profile);
    // profile.emails
    const { emails } = profile;
    // console.log('email', emails)
    // done(null, { emails });
    return { emails };
  }
}
