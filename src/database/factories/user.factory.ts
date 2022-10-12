import { setSeederFactory } from 'typeorm-extension';
import { User } from '../../user/user.entity';

export default setSeederFactory(User, (faker) => {
  const user = new User();
  user.id = faker.datatype.uuid();
  user.name = faker.name.fullName();
  user.phone = faker.phone.number('010-####-####');
  user.birthDate = faker.random.numeric(6);
  user.creditRate = 10;

  return user;
});
