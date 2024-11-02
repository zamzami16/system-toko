import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { AuthSignIn } from '../src/model/auth.model';
import {
  JenisBarang,
  JenisPajak,
  Kas,
  StatusArusKas,
  TypeAkun,
} from '@prisma/client';
import {
  CreateBarangRequest,
  UpdateBarangRequest,
} from '../src/model/data.master/barang.model';
import { randomUUID } from 'crypto';
import { TypeKas } from '../src/model/akun.model';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private authService: AuthService,
  ) {}

  async terminatePrisma() {
    await this.prismaService.$disconnect();
  }

  async deleteUserTest() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createUserTest() {
    const password = await bcrypt.hash('test', 10);
    let contact = await this.prismaService.contact.findFirst({
      where: {
        nama: 'user',
      },
    });
    if (!contact) {
      contact = await this.prismaService.contact.create({
        data: {
          nama: 'user',
        },
      });
    }

    await this.prismaService.user.create({
      data: {
        username: 'test',
        password: password,
        contactId: contact.id,
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
    await this.deleteSupplierBarangTest();

    await this.createKategoriTest();
    await this.createSubkategoriTest();
    await this.createSatuanTest();
    await this.createSupplierBarangTest();
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
        jenisBarang: JenisBarang.Barang,
      },
    });
  }

  async createMultiKategoriTest(total: number = 10) {
    const data = [];
    for (let i = 0; i < total; i++) {
      data.push({
        nama: 'test ' + (i + 1),
        jenisBarang: JenisBarang.Barang,
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
        jenisBarang: JenisBarang.Barang,
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
        jenisBarang: JenisBarang.Barang,
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
        jenisBarang: JenisBarang.Barang,
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
        jenisBarang: JenisBarang.Barang,
      });
    }
    await this.prismaService.satuanBarang.createMany({
      data: data,
    });
  }

  async getSupplierBarangTest() {
    return await this.prismaService.supplier.findFirst({
      where: {
        contact: {
          nama: 'supplier barang test',
        },
      },
    });
  }

  async createSupplierBarangTest() {
    const supplier = await this.prismaService.supplier.create({
      data: {
        maxHutang: 2_000_000_000,
        saldoAwalHutang: 2_000_000,
        saldoHutang: 5_000_000,
        jatuhTempo: 35,
        contact: {
          create: {
            nama: 'supplier barang test',
          },
        },
      },
      include: {
        contact: true,
      },
    });
    return supplier;
  }

  async deleteSupplierBarangTest() {
    await this.deleteSupplierTestInternal('supplier barang test');
  }

  async getAllSuppliers() {
    return await this.prismaService.supplier.findMany({});
  }

  async getLastSupplierId() {
    const suppliers = await this.getAllSuppliers();
    const lastSupplierContactId =
      suppliers.length > 0
        ? suppliers.reduce(
            (max, supplier) => Math.max(max, supplier.contactId),
            0,
          )
        : 0;
    return lastSupplierContactId;
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
    const supplier = await this.getSupplierBarangTest();

    const barang = new CreateBarangRequest();
    barang.nama = 'test';
    barang.kategoriId = kategori.id;
    barang.satuanId = satuan.id;
    barang.subkategoriId = subkategori.id;
    barang.supplierContactId = supplier.contactId;

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
    b.diskonPersen = barang.diskonPersen.toNumber();
    b.diskonRp = barang.diskonRp.toNumber();
    b.expired = barang.expired;
    b.hargaBeli_3 = barang.hargaBeli_3.toNumber();
    b.hargaBeliAkhir = barang.hargaBeliAkhir.toNumber();
    b.hargaJual_1 = barang.hargaJual_1.toNumber();
    b.hargaJual_2 = barang.hargaJual_2.toNumber();
    b.hargaJual_3 = barang.hargaJual_3.toNumber();
    b.hpp = barang.hpp.toNumber();
    b.isActive = barang.isActive;
    b.jenisBarang = barang.jenisBarang;
    b.jumlahAwal = barang.jumlahAwal.toNumber();
    b.jumlahStok = barang.jumlahStok.toNumber();
    b.kategoriId = barang.kategoriId;
    b.keterangan = barang.keterangan;
    b.nama = barang.nama;
    b.satuanId = barang.satuanId;
    b.subkategoriId = barang.subkategoriId;
    b.supplierContactId = barang.supplierContactId;
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

  async deleteContactTest(nama: string = 'contact test') {
    await this.prismaService.contact.deleteMany({
      where: {
        nama: {
          contains: nama,
          mode: 'insensitive',
        },
      },
    });
  }

  async createContactComplementTest(nama: string) {
    const contact = await this.prismaService.contact.create({
      data: {
        nama: nama,
      },
    });
    return contact;
  }

  async createContactMulti(total: number = 10) {
    const contacts = [];
    for (let i = 0; i < total; i++) {
      contacts.push({
        nama: 'Contact Multi Test ' + (i + 1),
        alamat: 'Alamat ' + (i + 1),
        email: `ContactMulti${i + 1}@test.com`,
        noHp: `${i + 1}89723662231`,
      });
    }

    await this.prismaService.contact.createMany({
      data: contacts,
    });
  }

  async deleteContactMultiTest() {
    await this.prismaService.contact.deleteMany({
      where: {
        nama: {
          contains: 'Contact Multi Test',
          mode: 'insensitive',
        },
      },
    });
  }

  async createContactTest() {
    return await this.createContactComplementTest('contact test');
  }

  async deleteSupplierTestInternal(nama: string) {
    const deleteSupplier = this.prismaService.supplier.deleteMany({
      where: {
        contact: {
          nama: {
            contains: nama,
            mode: 'insensitive',
          },
        },
      },
    });

    const deleteContact = this.prismaService.contact.deleteMany({
      where: {
        nama: {
          contains: nama,
          mode: 'insensitive',
        },
      },
    });

    await this.prismaService.$transaction([deleteSupplier, deleteContact]);
  }

  async deleteSupplierTest() {
    await this.deleteSupplierTestInternal('supplier test');
  }

  async deleteSupplierMultiTest() {
    await this.deleteSupplierTestInternal('supplier multi test');
  }

  async createSupplierTest() {
    const supplier = await this.prismaService.supplier.create({
      data: {
        maxHutang: 2_000_000_000,
        saldoAwalHutang: 2_000_000,
        saldoHutang: 5_000_000,
        jatuhTempo: 35,
        contact: {
          create: {
            nama: 'supplier test',
          },
        },
      },
      include: {
        contact: true,
      },
    });
    return supplier;
  }

  async createSupplierMultiTest(total: number = 10) {
    const inserts = [];
    for (let i = 0; i < total; i++) {
      const inc = i + 1;
      inserts.push(
        this.prismaService.supplier.create({
          data: {
            maxHutang: 2_000_000_000 * inc,
            saldoAwalHutang: 2_000_000 * inc,
            saldoHutang: 5_000_000 * inc,
            jatuhTempo: 35 * inc,
            contact: {
              create: {
                nama: `supplier multi test ${inc}`,
                alamat: 'Alamat ' + inc,
                email: `ContactMulti${inc}@test.com`,
                noHp: `${inc}89723662`,
              },
            },
          },
        }),
      );
    }

    const supplier = await this.prismaService.$transaction(inserts);
    return supplier;
  }

  async createContactSupplierTest() {
    return await this.prismaService.contact.create({
      data: {
        nama: 'supplier test',
      },
    });
  }

  async deleteGudangTest() {
    await this.prismaService.gudang.deleteMany({
      where: {
        nama: {
          contains: 'gudang test',
        },
      },
    });
  }

  async createGudangTest() {
    return await this.prismaService.gudang.create({
      data: {
        nama: 'gudang test',
        alamat: 'jl. in aja dulu',
        keterangan: 'gudang untuk test',
        isActive: true,
      },
    });
  }

  async getGudangTest(gudang_id: number) {
    return await this.prismaService.gudang.findUnique({
      where: {
        id: gudang_id,
      },
    });
  }

  async createGudangMultiTest(num: number = 10) {
    const gudangs = [];
    for (let i = 0; i < num; i++) {
      const inc = i + 1;
      gudangs.push({
        nama: `gudang multi test ${inc}`,
        alamat: `Alamat multi test ${inc}`,
        keterangan: `Keterangan multi test`,
        isActive: true,
      });
    }
    await this.prismaService.gudang.createMany({
      data: gudangs,
    });
  }

  async deleteGudangMultiTest() {
    await this.prismaService.gudang.deleteMany({
      where: {
        nama: {
          contains: 'gudang multi test',
          mode: 'insensitive',
        },
      },
    });
  }

  async deleteJenisPelangganTest(nama: string = 'jenis pelanggan test') {
    await this.prismaService.jenisPelanggan.deleteMany({
      where: {
        nama: {
          contains: nama,
          mode: 'insensitive',
        },
      },
    });
  }

  async createJenisPelangganTest(nama: string = 'jenis pelanggan test') {
    return await this.prismaService.jenisPelanggan.create({
      data: {
        nama: nama,
      },
    });
  }

  async createJenisPelangganDefaultTest() {
    return await this.prismaService.jenisPelanggan.create({
      data: {
        nama: 'jenis pelanggan test',
        isDefault: true,
      },
    });
  }

  async createJenisPelangganMultiTest(total: number = 10) {
    const jenisPelanggans = [];
    for (let i = 0; i < total; i++) {
      const inc = i + 1;
      jenisPelanggans.push({
        nama: `jenis pelanggan multi test ${inc}`,
      });
    }
    await this.prismaService.jenisPelanggan.createMany({
      data: jenisPelanggans,
    });
  }

  async deleteJenisPelangganMultiTest() {
    await this.prismaService.jenisPelanggan.deleteMany({
      where: {
        nama: {
          contains: 'jenis pelanggan multi test',
          mode: 'insensitive',
        },
      },
    });
  }

  async deletePelangganTest(nama: string) {
    await this.prismaService.pelanggan.deleteMany({
      where: {
        contact: {
          nama: {
            contains: nama,
            mode: 'insensitive',
          },
        },
      },
    });
  }

  async recreatePelanggan(nama: string = 'jenis pelanggan pelanggan test') {
    await this.deletePelangganTest(nama);
    await this.deleteContactTest(nama);
    await this.deleteJenisPelangganTest(nama);

    const jenisPelanggan = await this.createJenisPelangganTest(nama);
    const contact = await this.createContactComplementTest(nama);
    return await this.prismaService.pelanggan.create({
      data: {
        jenisPelangganId: jenisPelanggan.id,
        isCanCredit: true,
        saldoPiutang: 0,
        maxPiutang: 2_000_000,
        limitHariPiutang: 30,
        jatuhTempo: 60,
        jenisPajak: JenisPajak.Inclusive,
        contactId: contact.id,
      },
    });
  }

  async isPelangganExists(contactId: number) {
    return await this.prismaService.pelanggan.findUnique({
      where: {
        contactId: contactId,
      },
    });
  }

  async recreatePelangganMultiTest(num: number = 10) {
    const pelanggan = 'pelanggan multi test';
    await this.deletePelangganTest(pelanggan);
    await this.deleteContactTest(pelanggan);
    await this.deleteJenisPelangganTest(pelanggan);

    const jenisPelanggan = await this.createJenisPelangganTest(pelanggan);
    const multi = [];
    for (let i = 0; i < num; i++) {
      const contact = await this.createContactComplementTest(
        pelanggan + ' ' + i,
      );
      multi.push({
        jenisPelangganId: jenisPelanggan.id,
        isCanCredit: i % 2 === 0,
        saldoPiutang: 0,
        maxPiutang: 2_000_000 * i,
        limitHariPiutang: 30 * i,
        jatuhTempo: 60 * i,
        jenisPajak: JenisPajak.Inclusive,
        contactId: contact.id,
      });
    }
    await this.prismaService.pelanggan.createMany({
      data: multi,
    });
  }

  async deleteKasTest() {
    await this.prismaService.$transaction(async (tx) => {
      const kas = await tx.kas.findMany({
        where: {
          nama: {
            contains: 'kas test',
            mode: 'insensitive',
          },
        },
        select: { kodeAkun: true, kodeAkunKartuKredit: true },
      });

      if (kas.length > 0) {
        await tx.kas.deleteMany({
          where: {
            nama: {
              contains: 'kas test',
              mode: 'insensitive',
            },
          },
        });

        // Filter out any null or undefined kodeAkun or kodeAkunKartuKredit
        const validKas = kas.filter((k) => k.kodeAkun || k.kodeAkunKartuKredit);

        const akunConditions = validKas
          .flatMap((k) => [
            k.kodeAkun ? { kode: k.kodeAkun } : null,
            k.kodeAkunKartuKredit ? { kode: k.kodeAkunKartuKredit } : null,
          ])
          .filter(Boolean); // Remove null values

        if (akunConditions.length > 0) {
          await tx.akun.deleteMany({
            where: {
              OR: akunConditions,
            },
          });
        }
      }
    });
  }

  async isAkunExists(kode: string) {
    return await this.prismaService.akun.findUnique({
      where: {
        kode: kode,
      },
    });
  }

  async createKasTest(namaKas: string = 'kas test 1'): Promise<Kas> {
    const nama = namaKas;
    const candidateCode = `11${TypeKas.Kas}`;

    return await this.prismaService.$transaction(async (tx) => {
      const count = await tx.akun.count({
        where: { kode: { startsWith: candidateCode } },
      });
      const kode = `${candidateCode}${(count + 1).toString().padStart(2, '0')}`;

      // Create akun entry
      const akun = await tx.akun.create({
        data: {
          kode,
          nama,
          levelAkun: 2,
          typeAkun: TypeAkun.AkunKas,
          statusArusKas: StatusArusKas.KasOperasional,
        },
      });

      // Create kas entry linked to akun
      return tx.kas.create({
        data: {
          nama,
          akun: { connect: { kode: akun.kode } },
          saldoKas: 0,
          keterangan: 'kas test',
          isActive: true,
        },
      });
    });
  }
}
