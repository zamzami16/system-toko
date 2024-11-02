import { ApiProperty } from '@nestjs/swagger';
import { JenisBarang } from '@prisma/client';

export class SubkategoriResponse {
  id: number;
  nama: string;
  jenisBarang: JenisBarang;
}

export class CreateSubkategoriRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang: JenisBarang;
}

export class UpdateSubkategoriRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang: JenisBarang;
}

export class SearchSubkategoriRequest {
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
