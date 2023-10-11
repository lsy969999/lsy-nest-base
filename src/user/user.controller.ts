import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserOneReqDto, RegistReqDto } from './dto/req.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('api/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userSn')
  getUserOne(@Body() data: GetUserOneReqDto) {
    return this.userService.getUserOne(data.userSn);
  }

  @Post()
  registUser(@Body() data: RegistReqDto) {
    return data;
  }
}
