import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Store } from './store.entity';
import { StoreService } from './store.service';

class MockRepository {
  async find() {
    const store1 = new Store();
    store1.id = 'testId1';
    store1.longitude = 0;
    store1.latitude = 0;
    const store2 = new Store();
    store2.id = 'testId2';
    store2.longitude = 1;
    store2.latitude = 1;

    return [store1, store2];
  }

  async findOne(options) {
    const store = new Store();
    store.id = 'test';
    const {
      where: { id },
    } = options;
    if (id === store.id) {
      return store;
    }

    return undefined;
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

      const stores = await storeService.findCandidateStores(userLongitude, userLatitude, [1], 0);

      expect(stores[0].id).toBe('testId1');
      expect(stores.length).toBe(1);
    });

    it('throw 404 error when there is no store in condition', async () => {
      const userLongitude = 100;
      const userLatitude = 100;

      try {
        await storeService.findCandidateStores(userLongitude, userLatitude, [1, 2], 1000);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getStoreById', () => {
    it('return store with id', async () => {
      const storeId = 'test';

      const store = await storeService.getStoreByIdForPublic(storeId);

      expect(store.id).toBe('test');
    });

    it('throw 404 error when there is no store with the id', async () => {
      const storeId = 'wrongTest';

      try {
        await storeService.getStoreByIdForPublic(storeId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
