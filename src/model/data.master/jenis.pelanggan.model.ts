export class JenisPelangganResponse {
  id: number;
  nama: string;
  isDefault: boolean;
}

export class CreateJenisPelangganRequest {
  nama: string;
}

export class UpdateJenisPelangganRequest {
  id: number;
  nama: string;
  isDefault: boolean;
}

export class SearchJenisPelangganRequest {
  nama?: string;
  isDefault?: boolean;
  page?: number;
  size?: number;
}
