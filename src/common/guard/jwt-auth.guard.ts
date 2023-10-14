import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import AuthService from 'src/auth/auth.service';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorator/role.decorator';
/**
 * @TODO bearer, cookie 둘다 체크
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('authguard');
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const token = request.cookies['at'];

    if (!token) {
      const error = new UnauthorizedException();
      this.logger.error(error.message, error.stack);
      throw error;
    }
    const secret = this.configService.get('jwt.secret');
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, { secret });
      this.logger.debug(payload);
    } catch (error) {
      this.logger.warn(error.message + 'refresh start');
      try {
        const newToken = await this.authService.refresh(token);
        const decoded = this.jwtService.decode(newToken.accessToken);
        payload = decoded;
        this.authService.setAccessCookieToClient(
          response,
          newToken.accessToken,
        );
      } catch (error) {
        this.logger.error(error.message, error.stack);
        throw new UnauthorizedException();
      }
    }
    const requireRole = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requireRole) {
      const userSn = payload['sub'];
      const userRole = await this.authService.getRole(userSn);
      const hasRole = requireRole.find((role) => role === userRole);
      if (!hasRole) {
        return false;
      }
    }

    return true;
  }
}
