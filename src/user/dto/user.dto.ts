import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  birthDate: string;

  @ApiProperty()
  creditRate: number;
}
