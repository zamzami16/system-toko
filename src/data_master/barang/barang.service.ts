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
import { ValidationService } from '../../common/validation.service';
import { BarangValidation } from './barang.validation';
import { SatuanService } from '../satuan/satuan.service';
import { randomUUID } from 'crypto';
import { Barang } from '@prisma/client';
import { WebResponse } from '../../model/web.response';

@Injectable()
export class BarangService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private kategoriService: KategoriService,
    private subkategoriService: SubkategoriService,
    private satuanService: SatuanService,
  ) {}

  toBarangResponse(barang: any): BarangResponse {
    const barangResponse: BarangResponse = {
      id: barang.id,
      nama: barang.nama,
      jenis_barang: barang.jenis_barang,
      satuan_id: barang.satuan_id,
      kategori_id: barang.kategori_id,
      subkategori_id: barang.subkategori_id,
      hpp: barang.hpp.toNumber(),
      harga_beli_akhir: barang.harga_beli_akhir.toNumber(),
      harga_beli_3: barang.harga_beli_3.toNumber(),
      harga_jual_1: barang.harga_jual_1.toNumber(),
      harga_jual_2: barang.harga_jual_2.toNumber(),
      harga_jual_3: barang.harga_jual_3.toNumber(),
      barcode: barang.barcode,
      expired: barang.expired,
      diskon_rp: barang.diskon_rp.toNumber(),
      diskon_persen: barang.diskon_persen.toNumber(),
      jumlah_stok: barang.jumlah_stok.toNumber(),
      jumlah_awal: barang.jumlah_awal.toNumber(),
      keterangan: barang.keterangan,
      is_active: barang.is_active,
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

  async create(request: CreateBarangRequest): Promise<BarangResponse> {
    const createRequest: CreateBarangRequest = this.validationService.validate(
      BarangValidation.CREATE,
      request,
    );

    if (createRequest.barcode.toUpperCase() !== 'OTOMATIS') {
      const baracodeBarangExists = await this.getBarangFromBarcode(
        createRequest.barcode,
      );

      if (baracodeBarangExists) {
        throw new HttpException(
          `Barcode: ${baracodeBarangExists.barcode} already used.`,
          400,
        );
      }
    } else {
      while (true) {
        createRequest.barcode = randomUUID().replace('-', '');
        const baracodeBarangExists = await this.getBarangFromBarcode(
          createRequest.barcode,
        );
        if (!baracodeBarangExists) {
          break;
        }
      }
    }

    const exists_barang = await this.prismaService.barang.findFirst({
      where: {
        nama: createRequest.nama,
      },
    });

    if (exists_barang) {
      throw new HttpException(
        `barang ${exists_barang.nama} already exists in database`,
        400,
      );
    }

    const barang = await this.prismaService.barang.create({
      data: createRequest,
      include: {
        kategories: true,
        subkategories: true,
        satuan: true,
      },
    });
    return this.toBarangResponse(barang);
  }

  async update(request: UpdateBarangRequest): Promise<BarangResponse> {
    const updatedRequest: UpdateBarangRequest = this.validationService.validate(
      BarangValidation.UPDATE,
      request,
    );

    let barang = await this.getBarangOr404(updatedRequest.id);

    barang = await this.prismaService.barang.update({
      data: updatedRequest,
      where: {
        id: updatedRequest.id,
      },
      include: {
        kategories: true,
        subkategories: true,
        satuan: true,
      },
    });

    if (!barang) {
      throw new HttpException(`Barang not found.`, 400);
    }

    return this.toBarangResponse(barang);
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
    let barang = await this.getBarangOr404(barang_id);
    barang = await this.prismaService.barang.findUnique({
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

    const skip = Math.ceil(searchRequest.size * (searchRequest.page - 1));
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
        total_page: total,
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
