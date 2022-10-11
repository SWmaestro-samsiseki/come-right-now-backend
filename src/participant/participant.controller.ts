import { Body, Controller, Delete, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { CreateParticipantInputDTO } from './dto/create-participant.input.dto';
import { CreateParticipantOutputDTO } from './dto/create-participant.output.dto';
import { ParticipantService } from './participant.service';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createParticipant(
    @getAccount() account: Account,
    @Body() createParticipantDTO: CreateParticipantInputDTO,
  ): Promise<CreateParticipantOutputDTO> {
    const { timeDealId } = createParticipantDTO;
    const userId = account.id;

    return await this.participantService.createParticipant(timeDealId, userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteParticipantById(@Param('id') id: number) {
    await this.participantService.deleteParticipantById(id);
    return;
  }
}
