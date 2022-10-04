import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { CreateParticipantInputDTO } from './dto/create-participant.dto';
import { ParticipantService } from './participant.service';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createParticipant(
    @getAccount() account: Account,
    @Body() createParticipantDTO: CreateParticipantInputDTO,
  ) {
    const { timeDealId } = createParticipantDTO;
    const userId = account.id;

    return await this.participantService.createParticipant(timeDealId, userId);
  }
}
