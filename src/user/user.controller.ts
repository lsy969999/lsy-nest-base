import { Body, Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserOneReqDto } from './dto/req.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('api/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userSn')
  getUserOne(@Body() data: GetUserOneReqDto) {
    return this.userService.getUserOne(data.userSn);
  }

  // @Post()
  // registUser(@Body() data: RegistReqDto) {
  //   return data;
  // }
}
