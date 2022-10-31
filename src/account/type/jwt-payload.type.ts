import { UserType } from 'src/enum/user-type.enum';

export type JWTPayload = {
  uuid: string;
  email: string;
  userType: UserType;
};
