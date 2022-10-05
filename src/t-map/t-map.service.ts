import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TMapService {
  constructor(private readonly httpService: HttpService) {}

  async getPathFromTmap(
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ) {
    const observableObject = this.httpService.post(
      'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&callback=function',
      {
        startX: longitude1,
        startY: latitude1,
        speed: 4,
        endX: longitude2,
        endY: latitude2,
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

    return path;
  }
}
