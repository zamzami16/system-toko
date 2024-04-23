export class ContacResponse {
  id: number;
  nama: string;
  alamat?: string;
  email?: string;
  no_hp?: string;
}

export class CreateContactRequest {
  nama: string;
  alamat?: string;
  email?: string;
  no_hp?: string;
}
