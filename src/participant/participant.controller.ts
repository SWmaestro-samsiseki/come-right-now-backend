import { Body, Controller, Post } from '@nestjs/common';
import { CreateParticipantDTO } from './dto/create-participant.dto';
import { ParticipantService } from './participant.service';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  async createParticipant(@Body() createParticipantDTO: CreateParticipantDTO) {
    const { timeDealId } = createParticipantDTO;
    //FIXME : user ID 로그인 정보 통해 가져오기
    const userId = 'u9';

    return await this.participantService.createParticipant(timeDealId, userId);
  }
}
