import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestService } from './test.service';
import { testParentCreateDto } from './dto/req.dto';

@Controller('api/test')
@ApiTags('test')
export class TestController {
  logger = new Logger(TestController.name);
  constructor(private readonly testService: TestService) {}

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
