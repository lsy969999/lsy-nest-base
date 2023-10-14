import { ApiProperty } from '@nestjs/swagger';

export class SignInResDto {
  @ApiProperty({ required: true })
  userSn: number;

  @ApiProperty({ required: true })
  nickName: string;
}

export class SignOutResDto {}

export class RegistResDto {
  // @ApiProperty({ required: true })
  // accessToken: string;

  @ApiProperty({ required: true })
  userSn: number;

  @ApiProperty({ required: true })
  nickName: string;
}

export class WithDrawResDto {}

export class RefresResDto {
  @ApiProperty({ required: true })
  accessToken: string;
}
