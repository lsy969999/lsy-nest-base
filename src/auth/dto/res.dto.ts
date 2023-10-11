import { ApiProperty } from '@nestjs/swagger';

export class SignInResDto {
  @ApiProperty({ required: true })
  accessToken: string;

  @ApiProperty({ required: true })
  refreshToken: string;
}

export class SignOutResDto {}
