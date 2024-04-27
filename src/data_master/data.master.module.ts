import { Module } from '@nestjs/common';
import { SubkategoriService } from './subkategori/subkategori.service';
import { SubkategoriController } from './subkategori/subkategori.controller';
import { CommonModule } from '../common/common.module';
import { KategoriService } from './kategori/kategori.service';
import { KategoriController } from './kategori/kategori.controller';
import { SatuanService } from './satuan/satuan.service';
import { SatuanController } from './satuan/satuan.controller';
import { BarangService } from './barang/barang.service';
import { BarangController } from './barang/barang.controller';

@Module({
  imports: [CommonModule],
  providers: [
    KategoriService,
    SubkategoriService,
    SatuanService,
    BarangService,
  ],
  controllers: [
    KategoriController,
    SubkategoriController,
    SatuanController,
    BarangController,
  ],
  exports: [
    SubkategoriService,
    KategoriService,
    SatuanService,
    BarangService,
  ],
})
export class DataMasterModule {}
