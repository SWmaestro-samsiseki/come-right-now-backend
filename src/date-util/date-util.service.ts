import { Injectable } from '@nestjs/common';
import { DayOfWeek } from 'src/enum/days-of-week.enum';

@Injectable()
export class DateUtilService {
  dayOfWeeks = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  getDayOfWeekToday(): DayOfWeek {
    const today = new Date();
    const dayOfWeekToday = this.dayOfWeeks[today.getDay()];

    return DayOfWeek[dayOfWeekToday];
  }
}
