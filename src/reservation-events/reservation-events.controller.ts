import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('reservation-events')
@Controller('reservation-events')
export class ReservationEventsController {}
