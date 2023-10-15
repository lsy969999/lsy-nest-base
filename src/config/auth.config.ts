import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleSecretId: process.env.GOOGLE_SECRET_ID,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));
