export class CreateContactRequest {
  nama: string;
  alamat?: string;
  email?: string;
  noHp?: string;
}

export class ContactResponse {
  id: number;
  nama: string;
  alamat: string;
  email: string;
  noHp: string;
}

export class UpdateContactRequest {
  id: number;
  nama?: string;
  alamat?: string;
  email?: string;
  noHp?: string;
}

export class SearchContactRequest {
  nama?: string;
  alamat?: string;
  email?: string;
  noHp?: string;
  page: number;
  size: number;
}
