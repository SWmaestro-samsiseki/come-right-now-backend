import { Injectable } from '@nestjs/common';
import { DayOfWeek } from 'src/enum/days-of-week.enum';
import { TMapService } from 'src/t-map/t-map.service';

@Injectable()
export class DateUtilService {
  constructor(private readonly tmapService: TMapService) {}

  parseDate(target: string): Date {
    return new Date(target);
  }

  dayOfWeeks = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  getDayOfWeekToday(): DayOfWeek {
    const today = new Date();
    const todayDayOfWeek = this.dayOfWeeks[today.getDay()];

    return DayOfWeek[todayDayOfWeek];
  }

  getNowDate() {
    return new Date();
  }

  addMinute(minuteArray: number[], date: Date): Date {
    for (const minute of minuteArray) {
      if (minute >= 1) {
        date.setMinutes(date.getMinutes() + minute);
      }
    }

    return date;
  }

  addHour(hour: number, date: Date): Date {
    date.setHours(date.getHours() + hour);
    return date;
  }

  async getPathTotalTimeFromTmap(
    userLatitude: number,
    userLongitude: number,
    storeLatitude: number,
    storeLongitude: number,
  ) {
    const path = await this.tmapService.getPathFromTmap(
      userLatitude,
      userLongitude,
      storeLatitude,
      storeLongitude,
    );
    const totalTime: number = Math.floor(path.totalTime / 60);

    return totalTime;
  }

  async getEstimatedTime(
    userLatitude: number,
    userLongitude: number,
    storeLatitude: number,
    storeLongitude: number,
    delayMinutes: number,
  ): Promise<Date> {
    const totalTime = await this.getPathTotalTimeFromTmap(
      userLatitude,
      userLongitude,
      storeLatitude,
      storeLongitude,
    );

    const nowDateTime = this.getNowDate();
    const estimatedTime = this.addMinute([delayMinutes, totalTime], nowDateTime);

    return estimatedTime;
  }
}
