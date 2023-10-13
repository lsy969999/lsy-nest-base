import { ApiProperty } from '@nestjs/swagger';

export class GetUserOneResDto {
  name: string;
  nickName: string;
  userSn: number;
}

// export class RegistResDto {
//   @ApiProperty({ required: true })
//   userSn: number;

//   @ApiProperty({ required: true })
//   accessToken: string;

//   @ApiProperty({ required: true })
//   refreshToken: string;
// }

// export class WithdrawResDto {}
