import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateParticipantDTO } from './dto/create-participant.dto';
import { ParticipantService } from './participant.service';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createParticipant(@Request() req, @Body() createParticipantDTO: CreateParticipantDTO) {
    const { timeDealId } = createParticipantDTO;
    const userId = req.user.id;

    return await this.participantService.createParticipant(timeDealId, userId);
  }
}
