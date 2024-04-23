import { ApiProperty } from '@nestjs/swagger';
import { JenisBarang } from '@prisma/client';

export class KategoriResponse {
  id: number;
  nama: string;
  jenis_barang: JenisBarang;
}

export class CreateKategoriRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
}

export class UpdatekategoriRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
}

export class SearchkategoriRequest {
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
