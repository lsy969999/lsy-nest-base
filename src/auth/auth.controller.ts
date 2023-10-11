import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@Controller('api/auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signIn')
  signIn() {
    return this.authService.signIn();
  }

  @Post('signOut')
  signOut() {
    return this.authService.signOut();
  }

  @Post('regist')
  signUp() {
    return this.authService.regist();
  }

  @Post('withdrawal')
  withdrawal() {
    return this.authService.withdrawal();
  }
}
