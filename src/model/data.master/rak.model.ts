import { ApiProperty } from '@nestjs/swagger';
import { JenisBarang } from '@prisma/client';

export class RakResponse {
  id: number;
  nama: string;
  jenis_barang: JenisBarang;
}

export class CreateRakRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
}

export class UpdateRakRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
}

export class SearchRakRequest {
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
