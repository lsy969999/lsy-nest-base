import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleSecretId: process.env.GOOGLE_SECRET_ID,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  kakaoClientId: process.env.KAKAO_CLIENT_ID,
  kakaoSecretId: process.env.KAKAO_SECRET_ID,
  kakaoCallbackUrl: process.env.KAKAO_CALLBACK_URL,
}));
