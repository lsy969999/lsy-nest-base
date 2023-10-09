import { Controller, Get, Logger } from '@nestjs/common';

@Controller('test')
export class TestController {
  logger = new Logger(TestController.name);

  @Get()
  testGet() {
    this.logger.debug('hi');
    return 'hi';
  }
}
