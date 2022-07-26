import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { StoreService } from './store.service';

class MockRepository {
  async find(options) {
    const store1 = new Store();
    store1.id = 'testId1';
    store1.longitude = 0;
    store1.latitude = 0;
    const store2 = new Store();
    store2.id = 'testId2';
    store2.longitude = 100;
    store2.latitude = 100;

    return [store1, store2];
  }
}

describe('StoreService', () => {
  let storeService: StoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Store),
          useClass: MockRepository,
        },
      ],
    }).compile();

    storeService = module.get<StoreService>(StoreService);
  });

  describe('findCandidateStores', () => {
    it('return filtered stores with valid distance range and categories', async () => {
      const userLongitude = 0;
      const userLatitude = 0;

      const stores = await storeService.findCandidateStores(
        userLongitude,
        userLatitude,
        ['testCategoriy'],
        0,
      );

      expect(stores[0].id).toBe('testId1');
      expect(stores.length).toBe(1);
    });
  });
});
