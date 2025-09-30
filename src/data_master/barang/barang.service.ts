import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { KategoriService } from '../kategori/kategori.service';
import { SubkategoriService } from '../subkategori/subkategori.service';
import {
  BarangResponse,
  CreateBarangRequest,
  SearchBarangRequest,
  UpdateBarangRequest,
} from '../../model/data.master/barang.model';
import {
  DetailGudangResponse,
  DetailSatuanResponse,
} from '../../model/data.master/property.barang.model';
import { ValidationService } from '../../common/validation.service';
import { BarangValidation } from './barang.validation';
import { SatuanService } from '../satuan/satuan.service';
import { randomUUID } from 'crypto';
import { $Enums, Barang, Supplier } from '@prisma/client';
import { WebResponse } from '../../model/web.response';
import { NotFoundError } from '../../common/toko.exceptions';
import { GudangService } from '../gudang/gudang.service';
import { GudangResponse } from '../../model/data.master/gudang.model';

@Injectable()
export class BarangService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private kategoriService: KategoriService,
    private subkategoriService: SubkategoriService,
    private satuanService: SatuanService,
    private gudangService: GudangService,
  ) {}

  toBarangResponse(
    barang: any,
    detailSatuans: any = null,
    detailGudangs: any = null,
  ): BarangResponse {
    const barangResponse: BarangResponse = {
      id: barang.id,
      nama: barang.nama,
      jenisBarang: barang.jenisBarang,
      satuanId: barang.satuanId,
      kategoriId: barang.kategoriId,
      subkategoriId: barang.subkategoriId,
      hpp: barang.hpp.toNumber(),
      hargaBeliAkhir: barang.hargaBeliAkhir.toNumber(),
      hargaBeli_3: barang.hargaBeli_3.toNumber(),
      hargaJual_1: barang.hargaJual_1.toNumber(),
      hargaJual_2: barang.hargaJual_2.toNumber(),
      hargaJual_3: barang.hargaJual_3.toNumber(),
      barcode: barang.barcode,
      expired: barang.expired,
      diskonRp: barang.diskonRp.toNumber(),
      diskonPersen: barang.diskonPersen.toNumber(),
      jumlahStok: barang.jumlahStok.toNumber(),
      jumlahAwal: barang.jumlahAwal.toNumber(),
      keterangan: barang.keterangan,
      isActive: barang.isActive,
      supplierContactId: barang.supplierContactId,
      detailSatuans: [
        {
          barangId: barang.id,
          satuanId: barang.satuanId,
          amount: 1,
          satun: !barang.satuan
            ? null
            : this.satuanService.toSatuanResponse(barang.satuan),
        },
      ],
      detailGudangs: [],
    };

    // Optionally map associated data if available
    if (barang.satuan) {
      barangResponse.satuan = this.satuanService.toSatuanResponse(
        barang.satuan,
      );
    }
    if (barang.kategories) {
      barangResponse.kategori = this.kategoriService.toKategoriResponse(
        barang.kategories,
      );
    }
    if (barang.subkategories) {
      barangResponse.subkategori =
        this.subkategoriService.toSubkategoriResponse(barang.subkategories);
    }

    if (detailSatuans) {
      barangResponse.detailSatuans = detailSatuans.map(
        (item: {
          barangId: number;
          satuanId: number;
          amount: { toNumber: () => number };
          satuan: { id: number; nama: string; jenisBarang: $Enums.JenisBarang };
        }) => {
          const detail = new DetailSatuanResponse();
          detail.barangId = item.barangId;
          detail.satuanId = item.satuanId;
          detail.amount = item.amount.toNumber();
          detail.satun = this.satuanService.toSatuanResponse(item.satuan);

          return detail;
        },
      );
    }

    if (detailGudangs) {
      barangResponse.detailGudangs = detailGudangs.map(
        (item: {
          barangId: number;
          gudangId: number;
          berat: number;
          jumlah: number;
          jumlahMinimal: number;
          satuans: {
            id: number;
            nama: string;
            jenisBarang: $Enums.JenisBarang;
          };
          gudangs: GudangResponse;
        }) => {
          const detail = new DetailGudangResponse();
          detail.barangId = item.barangId;
          detail.gudangId = item.gudangId;
          detail.berat = item.berat;
          detail.jumlah = item.jumlah;
          detail.jumlahMinimal = item.jumlahMinimal;
          detail.satuan = this.satuanService.toSatuanResponse(item.satuans);
          detail.gudang = item.gudangs;

          return detail;
        },
      );
    }

    return barangResponse;
  }

  async getBarangFromBarcode(barcode: string) {
    const barang = await this.prismaService.barang.findUnique({
      where: {
        barcode: barcode,
      },
    });

    return barang;
  }

  async getBarangOr404(barang_id: number): Promise<Barang> {
    const barang = await this.prismaService.barang.findUnique({
      where: {
        id: barang_id,
      },
    });
    if (!barang) {
      throw new HttpException('Barang not found', 404);
    }
    return barang;
  }

  async getSupplierBarangOr404(supplierContactId: number): Promise<Supplier> {
    const supplier = await this.prismaService.supplier.findUnique({
      where: {
        contactId: supplierContactId,
      },
    });
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }
    return supplier;
  }

  async create(request: CreateBarangRequest): Promise<BarangResponse> {
    const validatedCreateRequest: CreateBarangRequest =
      this.validationService.validate(BarangValidation.CREATE, request);

    if (
      validatedCreateRequest.barcode &&
      validatedCreateRequest.barcode.toUpperCase() !== 'OTOMATIS'
    ) {
      const baracodeBarangExists = await this.getBarangFromBarcode(
        validatedCreateRequest.barcode,
      );

      if (baracodeBarangExists) {
        throw new HttpException(
          `Barcode: ${baracodeBarangExists.barcode} already used.`,
          400,
        );
      }
    } else {
      while (true) {
        validatedCreateRequest.barcode = randomUUID().replace('-', '');
        const baracodeBarangExists = await this.getBarangFromBarcode(
          validatedCreateRequest.barcode,
        );
        if (!baracodeBarangExists) {
          break;
        }
      }
    }

    await this.getSupplierBarangOr404(validatedCreateRequest.supplierContactId);

    const exists_barang = await this.prismaService.barang.findFirst({
      where: {
        nama: validatedCreateRequest.nama,
      },
    });

    if (exists_barang) {
      throw new HttpException(
        `barang ${exists_barang.nama} already exists in database`,
        400,
      );
    }

    const { detailSatuans, detailGudangs, ...dataBarang } =
      validatedCreateRequest;
    const [barang, savedDetailSatuan, savedDetailGudang] =
      await this.prismaService.$transaction(async (prisma) => {
        const barang = await prisma.barang.create({
          data: dataBarang,
          include: {
            kategories: true,
            subkategories: true,
            satuan: true,
          },
        });

        const detailSatuanData = detailSatuans.map((detail) => ({
          ...detail,
          barangId: barang.id,
        }));

        const savedDetailSatuan = await prisma.detailSatuan.createManyAndReturn(
          {
            data: detailSatuanData,
            include: {
              satuan: true,
            },
          },
        );

        const gudangs = await prisma.gudang.findMany({
          select: {
            id: true,
          },
        });

        let dataGudang = [];
        let gudangNotInDetailGudangs = gudangs;

        if (detailGudangs) {
          gudangNotInDetailGudangs = gudangs.filter(
            (gudang) =>
              !detailGudangs.some((detail) => detail.gudangId === gudang.id),
          );
          dataGudang = detailGudangs.map((item) => {
            return {
              barangId: barang.id,
              ...item,
            };
          });
        }

        gudangNotInDetailGudangs.forEach((item) =>
          dataGudang.push({
            barangId: barang.id,
            satuanId: barang.satuanId,
            gudangId: item.id,
            jumlah: 0,
            jumlahMinimal: 0,
            berat: 0,
          }),
        );

        const savedDetailGudang = await prisma.detailGudang.createManyAndReturn(
          {
            data: dataGudang,
            include: {
              gudangs: true,
              satuans: true,
            },
          },
        );

        return [barang, savedDetailSatuan, savedDetailGudang];
      });

    return this.toBarangResponse(barang, savedDetailSatuan, savedDetailGudang);
  }

  async update(request: UpdateBarangRequest): Promise<BarangResponse> {
    const validatedUpdatedRequest: UpdateBarangRequest =
      this.validationService.validate(BarangValidation.UPDATE, request);

    const barang = await this.getBarangOr404(validatedUpdatedRequest.id);
    if (
      validatedUpdatedRequest.supplierContactId !== barang.supplierContactId
    ) {
      await this.getSupplierBarangOr404(
        validatedUpdatedRequest.supplierContactId,
      );
    }

    const { detailSatuans, ...updateBarangRequest } = validatedUpdatedRequest;
    const [updatedBarang, savedDetailSatuan] =
      await this.prismaService.$transaction(async (prisma) => {
        await prisma.detailSatuan.deleteMany({
          where: {
            barangId: updateBarangRequest.id,
          },
        });

        const savedDetailSatuan = await prisma.detailSatuan.createManyAndReturn(
          {
            data: detailSatuans,
            include: {
              satuan: true,
            },
          },
        );

        const barang = await prisma.barang.update({
          data: updateBarangRequest,
          where: {
            id: validatedUpdatedRequest.id,
          },
          include: {
            kategories: true,
            subkategories: true,
            satuan: true,
          },
        });

        return [barang, savedDetailSatuan];
      });

    return this.toBarangResponse(updatedBarang, savedDetailSatuan);
  }

  async remove(barang_id: number): Promise<BarangResponse> {
    let barang = await this.getBarangOr404(barang_id);
    barang = await this.prismaService.barang.delete({
      where: {
        id: barang_id,
      },
      include: {
        kategories: true,
        subkategories: true,
        satuan: true,
      },
    });
    return this.toBarangResponse(barang);
  }

  async detail(barang_id: number): Promise<BarangResponse> {
    await this.getBarangOr404(barang_id);
    const { detailSatuans, ...barang } =
      await this.prismaService.barang.findUnique({
        where: {
          id: barang_id,
        },
        include: {
          kategories: true,
          subkategories: true,
          satuan: true,
          detailSatuans: {
            include: {
              satuan: true,
            },
          },
        },
      });
    return this.toBarangResponse(barang, detailSatuans);
  }

  async search(
    request: SearchBarangRequest,
  ): Promise<WebResponse<BarangResponse[]>> {
    const searchRequest: SearchBarangRequest = this.validationService.validate(
      BarangValidation.SEARCH,
      request,
    );

    const query = await this.createFilter(searchRequest);
    const total = await this.prismaService.barang.count({
      where: {
        AND: query,
      },
    });

    const skip = searchRequest.size * (searchRequest.page - 1);
    const barangs = await this.prismaService.barang.findMany({
      where: {
        AND: query,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: barangs.map((barang) => this.toBarangResponse(barang)),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        totalPage: Math.ceil(total / searchRequest.size),
      },
    };
  }

  async createFilter(searchRequest: SearchBarangRequest) {
    const query = [];

    if (searchRequest.id) {
      query.push({
        AND: [
          {
            id: searchRequest.id,
          },
        ],
      });
    }

    if (searchRequest.nama) {
      query.push({
        AND: [
          {
            nama: {
              contains: searchRequest.nama,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (searchRequest.supplierContactId) {
      query.push({
        AND: [
          {
            supplierContactId: searchRequest.supplierContactId,
          },
        ],
      });
    }

    if (searchRequest.kategori) {
      query.push({
        AND: [
          {
            kategories: {
              nama: {
                contains: searchRequest.kategori,
                mode: 'insensitive',
              },
            },
          },
        ],
      });
    }

    if (searchRequest.subkategori) {
      query.push({
        AND: [
          {
            subkategories: {
              nama: {
                contains: searchRequest.subkategori,
                mode: 'insensitive',
              },
            },
          },
        ],
      });
    }

    if (searchRequest.satuan) {
      query.push({
        AND: [
          {
            satuan: {
              nama: {
                contains: searchRequest.satuan,
                mode: 'insensitive',
              },
            },
          },
        ],
      });
    }

    return query;
  }
}
