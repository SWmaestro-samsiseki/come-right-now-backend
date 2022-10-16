import { setSeederFactory } from 'typeorm-extension';
import { Store } from '../../store/store.entity';

export default setSeederFactory(Store, (faker) => {
  const store = new Store();
  store.id = faker.datatype.uuid();
  store.masterName = faker.name.fullName();
  store.storeName = faker.name.fullName();
  store.businessName = faker.name.fullName();
  store.storeType = '술집';
  store.address = faker.address.cityName();
  store.latitude = parseFloat(faker.address.latitude(36.4318557, 36.3504119, 7));
  store.longitude = parseFloat(faker.address.longitude(127.3869362, 127.298923, 7));
  store.storePhone = faker.phone.number('010-####-####');
  store.masterPhone = faker.phone.number('010-####-####');
  store.introduce = 'fake store!';
  store.businessNumber = 'fake store!';
  store.starRate = 5.0;

  return store;
});
