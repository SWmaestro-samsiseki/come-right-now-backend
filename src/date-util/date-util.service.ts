import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DayOfWeek } from 'src/enum/days-of-week.enum';

@Injectable()
export class DateUtilService {
  constructor(private readonly httpService: HttpService) {}

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
    const observableObject = this.httpService.post(
      'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&callback=function',
      {
        startX: userLongitude,
        startY: userLatitude,
        speed: 4,
        endX: storeLongitude,
        endY: storeLatitude,
        startName: 'user',
        endName: 'store',
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          appKey: process.env.TMAP_API_KEY,
        },
      },
    );
    const response = await firstValueFrom(observableObject);
    const path = response.data.features[0].properties;
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
