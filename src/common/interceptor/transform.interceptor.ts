import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
// import { Request } from 'express';
import { Observable, map } from 'rxjs';
//res interceptor ex
@Injectable()
export class TransformInterceptor<T, R> implements NestInterceptor<T, R> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<R> | Promise<Observable<R>> {
    return next.handle().pipe(
      map((data) => {
        // const http = context.switchToHttp();
        // const request = http.getRequest<Request>();
        if (Array.isArray(data)) {
        } else {
        }
        return data;
      }),
    );
  }
}
