import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantOutputDTO {
  @ApiProperty()
  timeDealId: number;

  @ApiProperty()
  participantId: number;
}
