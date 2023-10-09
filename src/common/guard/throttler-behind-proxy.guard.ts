import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
//throttler가 proxyip를 안보게하기위해
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }
}
