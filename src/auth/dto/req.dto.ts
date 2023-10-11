import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches, MaxLength } from 'class-validator';

export class SignInReqDto {
  @ApiProperty({ required: true, example: 'lsy@naver.com' })
  @IsEmail()
  @MaxLength(30)
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  password: string;
}

export class SignOutReqDto {}

export class RegistReqDto {
  @ApiProperty({ required: true, example: 'name' })
  name: string;

  @ApiProperty({ required: true, example: 'nickName' })
  nickName: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ required: true, example: 'lsy@naver.com' })
  @IsEmail()
  @MaxLength(30)
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  password: string;
}

export class WithdrawReqDto {}
