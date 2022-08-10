import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginInputDTO {
  @IsString()
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class LoginOutputDTO {
  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  userType: string;
}
