import { ApiProperty } from '@nestjs/swagger';

export class ValidationDTO {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  userType: string;
}
