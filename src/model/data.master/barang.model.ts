import { JenisBarang } from '@prisma/client';
import { SatuanResponse } from './satuan.model';
import { KategoriResponse } from './kategori.model';
import { SubkategoriResponse } from './subkategori.model';
import { ApiProperty } from '@nestjs/swagger';

export class BarangResponse {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
  satuan_id: number;
  satuan?: SatuanResponse;
  kategori_id: number;
  kategori?: KategoriResponse;
  subkategori_id: number;
  subkategori?: SubkategoriResponse;
  hpp: number = 0;
  harga_beli_akhir: number = 0;
  harga_beli_3: number = 0;
  harga_jual_1: number = 0;
  harga_jual_2: number = 0;
  harga_jual_3: number = 0;
  barcode: string;
  expired?: Date;
  diskon_rp: number = 0;
  diskon_persen: number = 0;
  jumlah_stok: number = 0;
  jumlah_awal: number = 0;
  keterangan: string = '';
  is_active: boolean = true;
}

export class CreateBarangRequest {
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    default: JenisBarang.Barang,
    isArray: false,
  })
  jenis_barang: JenisBarang = JenisBarang.Barang;
  satuan_id: number;
  kategori_id: number;
  subkategori_id: number;
  hpp: number = 0;
  harga_beli_akhir: number = 0;
  harga_beli_3: number = 0;
  harga_jual_1: number = 0;
  harga_jual_2: number = 0;
  harga_jual_3: number = 0;
  barcode: string;
  expired?: Date;
  diskon_rp: number = 0;
  diskon_persen: number = 0;
  jumlah_stok: number = 0;
  jumlah_awal: number = 0;
  keterangan: string = '';
  is_active: boolean = true;
}

export class UpdateBarangRequest {
  id: number;
  nama: string;

  @ApiProperty({
    enum: JenisBarang,
    isArray: false,
  })
  jenis_barang: JenisBarang;
  satuan_id: number;
  kategori_id: number;
  subkategori_id: number;
  hpp: number;
  harga_beli_akhir: number;
  harga_beli_3: number;
  harga_jual_1: number;
  harga_jual_2: number;
  harga_jual_3: number;
  barcode: string;
  expired?: Date;
  diskon_rp: number;
  diskon_persen: number;
  jumlah_stok: number;
  jumlah_awal: number;
  keterangan: string;
  is_active: boolean;
}

export class SearchBarangRequest {
  id?: number;
  nama?: string;
  kategori?: string;
  subkategori?: string;
  satuan?: string;
  page: number = 1;
  size: number = 10;
}
