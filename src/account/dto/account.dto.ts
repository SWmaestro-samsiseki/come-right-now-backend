import { IsString } from 'class-validator';

export class LoginInputDto {
  @IsString()
  email: string;
  password: string;
}

export class LoginOutputDTO {
  isSuccess: boolean;
  message: string;
  accessToken: string;
  userType: string;
}
