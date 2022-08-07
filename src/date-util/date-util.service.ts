import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DayOfWeek } from 'src/enum/days-of-week.enum';

@Injectable()
export class DateUtilService {
  constructor(private readonly httpService: HttpService) {}

  dayOfWeeks = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  getDayOfWeekToday(): DayOfWeek {
    const today = new Date();
    const dayOfWeekToday = this.dayOfWeeks[today.getDay()];

    return DayOfWeek[dayOfWeekToday];
  }

  addMinute(minuteArray: number[], date: Date) {
    for (const minute of minuteArray) {
      date.setMinutes(date.getMinutes() + minute);
    }

    return date;
  }

  async getEstimatedTime(
    userLatitude: number,
    userLongitude: number,
    storeLatitude: number,
    storeLongitude: number,
    delayMinutes: number,
  ): Promise<Date> {
    let nowDate = new Date();
    const ob = this.httpService.post(
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

    const result = await firstValueFrom(ob);
    const totalTime: number = result.data.features[0].properties.totalTime;
    nowDate = this.addMinute([delayMinutes, totalTime], nowDate);
    return nowDate;
  }
}
