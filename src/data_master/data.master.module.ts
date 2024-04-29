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

@Module({
  imports: [CommonModule, ContactModule],
  providers: [
    KategoriService,
    SubkategoriService,
    SatuanService,
    BarangService,
    SupplierService,
  ],
  controllers: [
    KategoriController,
    SubkategoriController,
    SatuanController,
    BarangController,
    SupplierController,
  ],
  exports: [
    SubkategoriService,
    KategoriService,
    SatuanService,
    BarangService,
    SupplierService,
  ],
})
export class DataMasterModule {}
