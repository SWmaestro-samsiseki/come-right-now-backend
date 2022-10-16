import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Store } from '../../store/store.entity';

export default class StoreSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const storeFactory = factoryManager.get(Store);

    await storeFactory.saveMany(10);
  }
}
