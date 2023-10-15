import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import AuthService from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';
import { GoogleStrategy } from './strategy/google.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';

@Global()
@Module({
  imports: [PrismaModule, PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, KakaoStrategy],
  exports: [AuthService],
})
export class AuthModule {}
