export class GudangResponse {
  id: number;
  nama: string;
  alamat: string;
  keterangan: string;
  is_active: boolean = true;
}

export class CreateGudangRequest {
  nama: string;
  alamat?: string;
  keterangan?: string;
  is_active: boolean = true;
}

export class UpdateGudangRequest {
  id: number;
  nama?: string;
  alamat?: string;
  keterangan?: string;
  is_active: boolean = true;
}

export class SearchGudangRequest {
  nama?: string;
  alamat?: string;
  keterangan?: string;
  is_active?: boolean;
  page: number;
  size: number;
}
