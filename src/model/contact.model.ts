export class CreateContactRequest {
  nama: string;
  alamat?: string;
  email?: string;
  no_hp?: string;
}

export class ContactResponse {
  id: number;
  nama: string;
  alamat: string;
  email: string;
  no_hp: string;
}

export class UpdateContactRequest {
  id: number;
  nama?: string;
  alamat?: string;
  email?: string;
  no_hp?: string;
}

export class SearchContactRequest {
  nama?: string;
  alamat?: string;
  email?: string;
  no_hp?: string;
  page: number;
  size: number;
}
