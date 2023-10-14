import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import AuthService from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  imports: [PrismaModule, PassportModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
