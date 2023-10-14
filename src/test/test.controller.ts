import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
  Render,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestService } from './test.service';
import { testParentCreateDto } from './dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';

@Controller('test')
@ApiTags('test')
@UseGuards(ThrottlerBehindProxyGuard)
export class TestController {
  logger = new Logger(TestController.name);
  constructor(private readonly testService: TestService) {}

  @Get('sse')
  @SkipThrottle()
  @Render('test/sse')
  sseView() {
    return {};
  }

  @Get('ws')
  @SkipThrottle()
  @Render('test/ws')
  wsView() {
    return {};
  }

  @Get('auth')
  @SkipThrottle()
  @Render('test/auth')
  view() {
    return { message: 'hi' };
  }

  @Get('/hi')
  testHi() {
    this.logger.debug('hi');
    return 'hi';
  }

  @Get()
  async testGetParent(@Req() request: Request) {
    console.log(request);
    console.log(request.cookies);
    return await this.testService.getTestParent();
  }

  @Post()
  async testPostParent(@Body() data: testParentCreateDto) {
    return await this.testService.createTestParent(data.name);
  }
}
