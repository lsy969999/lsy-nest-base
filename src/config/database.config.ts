import { registerAs } from '@nestjs/config';

export default registerAs('databse', () => ({
  type: process.env.DATABASE_TYPE,
  port: process.env.DATABASE_PORT,
  name: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  pass: process.env.DATABASE_PASS,
}));
