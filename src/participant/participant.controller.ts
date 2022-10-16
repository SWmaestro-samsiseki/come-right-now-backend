import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Account } from 'src/account/account.entity';
import { getAccount } from 'src/account/get-account.decorator';
import { TimeDealService } from 'src/time-deal/time-deal.service';
import { CreateParticipantInputDTO } from './dto/create-participant.input.dto';
import { CreateParticipantOutputDTO } from './dto/create-participant.output.dto';
import { Participant } from './participant.entity';
import { ParticipantService } from './participant.service';

@ApiTags('participant')
@Controller('participant')
export class ParticipantController {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly timeDealService: TimeDealService,
  ) {}

  @ApiHeader({
    name: 'Authorization',
    description: 'JWT Token',
  })
  @ApiCreatedResponse({
    description: 'CreateParticipantOutputDTO',
    type: CreateParticipantOutputDTO,
  })
  @ApiNotFoundResponse({
    description: 'Not Found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal Server Error',
  })
  @Post()
  @UseGuards(AuthGuard())
  async createParticipant(
    @getAccount() account: Account,
    @Body() createParticipantDTO: CreateParticipantInputDTO,
  ): Promise<CreateParticipantOutputDTO> {
    await this.timeDealService.checkTimeDealValidation();
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

  @Get(':id')
  async getParticipantById(@Param('id') participantId: number): Promise<Participant> {
    return await this.participantService.getParticipantById(participantId);
  }
}
