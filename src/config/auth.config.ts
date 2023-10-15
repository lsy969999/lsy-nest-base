import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleSecretId: process.env.GOOGLE_SECRET_ID,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  kakaoClientId: process.env.KAKAO_CLIENT_ID,
  kakaoSecretId: process.env.KAKAO_SECRET_ID,
  kakaoCallbackUrl: process.env.KAKAO_CALLBACK_URL,
  naverClientId: process.env.NAVER_CLIENT_ID,
  naverSecretId: process.env.NAVER_SECRET_ID,
  naverCallbackUrl: process.env.NAVER_CALLBACK_URL,
}));
