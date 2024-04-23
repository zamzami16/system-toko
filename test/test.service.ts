import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { AuthSignIn } from '../src/model/auth.model';
import { JenisBarang } from '@prisma/client';
import {
  CreateBarangRequest,
  UpdateBarangRequest,
} from '../src/model/data.master/barang.model';
import { randomUUID } from 'crypto';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  async deleteUserTest() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createUserTest() {
    const password = await bcrypt.hash('test', 10);
    let contact = await this.prismaService.contact.findFirst();
    if (!contact) {
      contact = await this.prismaService.contact.create({
        data: {
          nama: 'test',
        },
      });
    }

    await this.prismaService.user.create({
      data: {
        username: 'test',
        password: password,
        contact_id: contact.id,
      },
    });
  }

  async createUserAndLoginTest() {
    await this.deleteUserTest();
    await this.createUserTest();
    const sigin: AuthSignIn = {
      username: 'test',
      password: 'test',
    };
    const result = await this.authService.signIn(sigin);
    return result;
  }

  async recreatePropertiBarang() {
    await this.deleteBarangTest();
    await this.deleteBarangMultiTest();
    await this.deleteKategoriTest();
    await this.deleteSubkategoriTest();
    await this.deleteSatuanTest();

    await this.createKategoriTest();
    await this.createSubkategoriTest();
    await this.createSatuanTest();
  }

  async deleteKategoriTest() {
    await this.prismaService.kategoriBarang.deleteMany({
      where: {
        nama: {
          contains: 'test',
        },
      },
    });
  }

  async createKategoriTest() {
    await this.prismaService.kategoriBarang.create({
      data: {
        nama: 'test',
        jenis_barang: JenisBarang.Barang,
      },
    });
  }

  async createMultiKategoriTest(total: number = 10) {
    const data = [];
    for (let i = 0; i < total; i++) {
      data.push({
        nama: 'test ' + (i + 1),
        jenis_barang: JenisBarang.Barang,
      });
    }
    await this.prismaService.kategoriBarang.createMany({
      data: data,
    });
  }

  async getKategoriTest() {
    return await this.prismaService.kategoriBarang.findFirst({
      where: { nama: 'test' },
    });
  }

  async deleteSubkategoriTest() {
    await this.prismaService.subKategoriBarang.deleteMany({
      where: {
        nama: {
          contains: 'test',
        },
      },
    });
  }

  async createSubkategoriTest() {
    await this.prismaService.subKategoriBarang.create({
      data: {
        nama: 'test',
        jenis_barang: JenisBarang.Barang,
      },
    });
  }

  async getSubkategoriTest() {
    return await this.prismaService.subKategoriBarang.findFirst({
      where: { nama: 'test' },
    });
  }

  async createMultiSubkategoriTest(total: number = 10) {
    const data = [];
    for (let i = 0; i < total; i++) {
      data.push({
        nama: 'test ' + (i + 1),
        jenis_barang: JenisBarang.Barang,
      });
    }
    await this.prismaService.subKategoriBarang.createMany({
      data: data,
    });
  }

  async deleteSatuanTest() {
    await this.prismaService.satuanBarang.deleteMany({
      where: {
        nama: {
          contains: 'test',
        },
      },
    });
  }

  async createSatuanTest() {
    await this.prismaService.satuanBarang.create({
      data: {
        nama: 'test',
        jenis_barang: JenisBarang.Barang,
      },
    });
  }

  async getSatuanTest() {
    return await this.prismaService.satuanBarang.findFirst({
      where: { nama: 'test' },
    });
  }

  async createMultiSatuanTest(total: number = 10) {
    const data = [];
    for (let i = 0; i < total; i++) {
      data.push({
        nama: 'test ' + (i + 1),
        jenis_barang: JenisBarang.Barang,
      });
    }
    await this.prismaService.satuanBarang.createMany({
      data: data,
    });
  }

  async deleteBarangTest() {
    await this.prismaService.barang.deleteMany({
      where: {
        nama: {
          contains: 'test',
        },
      },
    });
  }

  async createBarang(): Promise<CreateBarangRequest> {
    const kategori = await this.getKategoriTest();
    const subkategori = await this.getSubkategoriTest();
    const satuan = await this.getSatuanTest();

    const barang = new CreateBarangRequest();
    barang.nama = 'test';
    barang.kategori_id = kategori.id;
    barang.satuan_id = satuan.id;
    barang.subkategori_id = subkategori.id;

    return barang;
  }

  async createBarangTest() {
    const barang = await this.createBarang();
    barang.barcode = randomUUID().replace('-', '');
    await this.prismaService.barang.create({
      data: barang,
    });
  }

  async deleteBarangMultiTest() {
    await this.prismaService.barang.deleteMany({
      where: {
        nama: {
          contains: 'Multi',
          mode: 'insensitive',
        },
      },
    });
  }

  async createBarangMultiTest(total: number = 16) {
    await this.deleteBarangMultiTest();
    const barangs = [];
    for (let i = 0; i < total; i++) {
      const barang = await this.createBarang();
      barang.nama = `Barang Multi ${i + 1}`;
      barang.barcode = randomUUID().replace('-', '');
      barangs.push(barang);
    }
    await this.prismaService.barang.createMany({
      data: barangs,
    });
  }

  async getBarangTest(): Promise<UpdateBarangRequest> {
    const barang = await this.prismaService.barang.findFirst({
      where: {
        nama: 'test',
      },
    });

    const b = await this.createBarang();
    b.barcode = barang.barcode;
    b.diskon_persen = barang.diskon_persen.toNumber();
    b.diskon_rp = barang.diskon_rp.toNumber();
    b.expired = barang.expired;
    b.harga_beli_3 = barang.harga_beli_3.toNumber();
    b.harga_beli_akhir = barang.harga_beli_akhir.toNumber();
    b.harga_jual_1 = barang.harga_jual_1.toNumber();
    b.harga_jual_2 = barang.harga_jual_2.toNumber();
    b.harga_jual_3 = barang.harga_jual_3.toNumber();
    b.hpp = barang.hpp.toNumber();
    b.is_active = barang.is_active;
    b.jenis_barang = barang.jenis_barang;
    b.jumlah_awal = barang.jumlah_awal.toNumber();
    b.jumlah_stok = barang.jumlah_stok.toNumber();
    b.kategori_id = barang.kategori_id;
    b.keterangan = barang.keterangan;
    b.nama = barang.nama;
    b.satuan_id = barang.satuan_id;
    b.subkategori_id = barang.subkategori_id;
    return {
      id: barang.id,
      ...b,
    };
  }

  async isBarangExists(barang_id: number) {
    const total = await this.prismaService.barang.count({
      where: { id: barang_id },
    });
    return total > 0;
  }

  async getTotalBarang() {
    return await this.prismaService.barang.count();
  }
}
