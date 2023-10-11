import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
  Render,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestService } from './test.service';
import { testParentCreateDto } from './dto/req.dto';
import { ThrottlerBehindProxyGuard } from 'src/common/guard/throttler-behind-proxy.guard';

@Controller('test')
@ApiTags('test')
@UseGuards(ThrottlerBehindProxyGuard)
export class TestController {
  logger = new Logger(TestController.name);
  constructor(private readonly testService: TestService) {}

  @Get('view')
  @Render('index')
  view() {
    return { message: 'hi' };
  }

  @Get('/hi')
  testHi() {
    this.logger.debug('hi');
    return 'hi';
  }

  @Get()
  async testGetParent() {
    return await this.testService.getTestParent();
  }

  @Post()
  async testPostParent(@Body() data: testParentCreateDto) {
    return await this.testService.createTestParent(data.name);
  }
}
