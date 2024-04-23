import { ApiProperty } from '@nestjs/swagger';
import { JenisBarang } from '@prisma/client';

export class SatuanResponse {
  id: number;
  nama: string;
  jenis_barang: JenisBarang;
}

export class CreateSatuanRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
}

export class UpdateSatuanRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
}

export class SearchSatuanRequest {
  id?: number;
  nama?: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang?: JenisBarang;
  page?: number;
  size?: number;
}
