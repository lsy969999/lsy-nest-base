import { ApiProperty } from '@nestjs/swagger';
import { AccountProvider } from '@prisma/client';
import { IsEmail, IsIn, Matches, MaxLength } from 'class-validator';

export class SignInReqDto {
  @ApiProperty({ required: true, example: 'example@example.com' })
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

  @ApiProperty({ required: true, example: AccountProvider.EMAIL })
  @IsIn([...Object.values(AccountProvider)])
  provider: AccountProvider;

  @ApiProperty()
  providerId: string;

  @ApiProperty({ required: true, example: 'example@example.com' })
  @IsEmail({}, { message: '이메일 형식이 아닙니다.' })
  @MaxLength(30)
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  password: string;
}

export class RefreshReqDto {
  // @ApiProperty({ required: true })
  // accessToken: string;
}

export class WithDrawReqDto {}
