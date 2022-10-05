import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantInputDTO {
  @ApiProperty()
  timeDealId: number;
}
