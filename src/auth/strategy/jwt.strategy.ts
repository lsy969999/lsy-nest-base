import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const refreshedName = this.configService.get('jwt.refreshedName');
          const refreshed = request.headers[refreshedName];
          if (refreshed) {
            return refreshed;
          }
          const cookieName = this.configService.get('jwt.cookieName');
          const token = request.cookies[cookieName];
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    // console.log('validate', payload);
    return payload.sub;
  }
}
