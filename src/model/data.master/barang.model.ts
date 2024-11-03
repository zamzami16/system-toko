import { JenisBarang } from '@prisma/client';
import { SatuanResponse } from './satuan.model';
import { KategoriResponse } from './kategori.model';
import { SubkategoriResponse } from './subkategori.model';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetailSatuanRequestDto {
  satuanId: number;
  amount: number;
}

export class UpdateDetailSatuanRequestDto extends CreateDetailSatuanRequestDto {
  barangId: number;
}

export class DetailSatuanResponse {
  barangId: number;
  satuanId: number;
  amount: number;
  satun: SatuanResponse;
}

export class BarangResponse {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang: JenisBarang;
  satuanId: number;
  satuan?: SatuanResponse;
  kategoriId: number;
  kategori?: KategoriResponse;
  subkategoriId: number;
  subkategori?: SubkategoriResponse;
  hpp: number = 0;
  hargaBeliAkhir: number = 0;
  hargaBeli_3: number = 0;
  hargaJual_1: number = 0;
  hargaJual_2: number = 0;
  hargaJual_3: number = 0;
  barcode: string;
  expired?: Date;
  diskonRp: number = 0;
  diskonPersen: number = 0;
  jumlahStok: number = 0;
  jumlahAwal: number = 0;
  keterangan: string = '';
  isActive: boolean = true;
  supplierContactId: number;
  detailSatuans: DetailSatuanResponse[];
}

export class CreateBarangRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    default: JenisBarang.Barang,
    isArray: false,
  })
  jenisBarang: JenisBarang = JenisBarang.Barang;
  satuanId: number;
  kategoriId: number;
  subkategoriId: number;
  hpp: number = 0;
  hargaBeliAkhir: number = 0;
  hargaBeli_3: number = 0;
  hargaJual_1: number = 0;
  hargaJual_2: number = 0;
  hargaJual_3: number = 0;
  barcode: string;
  expired?: Date;
  diskonRp: number = 0;
  diskonPersen: number = 0;
  jumlahStok: number = 0;
  jumlahAwal: number = 0;
  keterangan: string = '';
  isActive: boolean = true;
  supplierContactId: number;
  detailSatuans: CreateDetailSatuanRequestDto[];
}

export class UpdateBarangRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenisBarang: JenisBarang;
  satuanId: number;
  kategoriId: number;
  subkategoriId: number;
  hpp: number;
  hargaBeliAkhir: number;
  hargaBeli_3: number;
  hargaJual_1: number;
  hargaJual_2: number;
  hargaJual_3: number;
  barcode: string;
  expired?: Date;
  diskonRp: number;
  diskonPersen: number;
  jumlahStok: number;
  jumlahAwal: number;
  keterangan: string;
  isActive: boolean;
  supplierContactId: number;
  detailSatuans: UpdateDetailSatuanRequestDto[];
}

export class SearchBarangRequest {
  id?: number;
  nama?: string;
  kategori?: string;
  subkategori?: string;
  satuan?: string;
  supplierContactId?: number;
  page: number = 1;
  size: number = 10;
}
