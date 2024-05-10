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
import { SupplierService } from './supplier/supplier.service';
import { SupplierController } from './supplier/supplier.controller';
import { ContactModule } from './contact/contact.module';
import { GudangService } from './gudang/gudang.service';
import { GudangController } from './gudang/gudang.controller';
import { JenisPelangganService } from './jenis.pelanggan/jenis.pelanggan.service';
import { JenisPelangganController } from './jenis.pelanggan/jenis.pelanggan.controller';
import { PelangganService } from './pelanggan/pelanggan.service';
import { PelangganController } from './pelanggan/pelanggan.controller';

@Module({
  imports: [CommonModule, ContactModule],
  providers: [
    KategoriService,
    SubkategoriService,
    SatuanService,
    BarangService,
    SupplierService,
    GudangService,
    JenisPelangganService,
    PelangganService,
  ],
  controllers: [
    KategoriController,
    SubkategoriController,
    SatuanController,
    BarangController,
    SupplierController,
    GudangController,
    JenisPelangganController,
    PelangganController,
  ],
  exports: [
    SubkategoriService,
    KategoriService,
    SatuanService,
    BarangService,
    SupplierService,
    GudangService,
    JenisPelangganService,
    PelangganService,
  ],
})
export class DataMasterModule {}
