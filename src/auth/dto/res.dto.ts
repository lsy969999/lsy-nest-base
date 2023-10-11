import { ApiProperty } from '@nestjs/swagger';

export class SignInResDto {
  @ApiProperty({ required: true })
  accessToken: string;

  @ApiProperty({ required: true })
  refreshToken: string;
}

export class SignOutResDto {}

export class RegistResDto {
  @ApiProperty({ required: true })
  userSn: number;

  @ApiProperty({ required: true })
  accessToken: string;

  @ApiProperty({ required: true })
  refreshToken: string;
}

export class WithdrawResDto {}
