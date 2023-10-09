import { ApiProperty } from '@nestjs/swagger';

export class testParentCreateDto {
  @ApiProperty({ required: true })
  name: string;
}
