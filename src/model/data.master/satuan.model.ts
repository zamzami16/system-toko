import { ApiProperty } from '@nestjs/swagger';
import { JenisBarang } from '@prisma/client';

export class SatuanResponse {
  id: number;
  nama: string;
  jenisBarang: JenisBarang;
}

export class CreateSatuanRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang: JenisBarang;
}

export class UpdateSatuanRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang: JenisBarang;
}

export class SearchSatuanRequest {
  id?: number;
  nama?: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang?: JenisBarang;
  page?: number;
  size?: number;
}
