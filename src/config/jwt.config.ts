import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  cookieName: 'at',
  accessTokenExp: 24 * 60 * 60 * 1,
  refreshTokenExp: 30 * 24 * 60 * 60 * 1,
  cookieExp: 30 * 24 * 60 * 60 * 1000,
}));
