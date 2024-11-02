export class UserResponse {
  username: string;
  token: string;
}

export class RegisterUserRequestDto {
  username: string;
  password: string;
  nama: string;
  alamat?: string;
  email?: string;
  noHp?: string;
}
