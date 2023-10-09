import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('api/test')
@ApiTags('test')
export class TestController {
  logger = new Logger(TestController.name);

  @Get()
  testGet() {
    this.logger.debug('hi');
    return 'hi';
  }
}
