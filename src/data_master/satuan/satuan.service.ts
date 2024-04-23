import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { SatuanValidation } from './satuan.validation';
import { SatuanBarang } from '@prisma/client';
import { WebResponse } from '../../model/web.response';
import {
  CreateSatuanRequest,
  SatuanResponse,
  UpdateSatuanRequest,
  SearchSatuanRequest,
} from '../../model/data.master/satuan.model';

@Injectable()
export class SatuanService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toSatuanResponse(satuan: SatuanBarang): SatuanResponse {
    return {
      id: satuan.id,
      nama: satuan.nama,
      jenis_barang: satuan.jenis_barang,
    };
  }

  async getSatuanOr404(satuan_id: number) {
    const satuan = await this.prismaService.satuanBarang.findUnique({
      where: { id: satuan_id },
    });

    if (!satuan) {
      throw new HttpException('Data Not Found.', 404);
    }

    return satuan;
  }

  async create(request: CreateSatuanRequest): Promise<SatuanResponse> {
    const createRequest: CreateSatuanRequest = this.validationService.validate(
      SatuanValidation.CREATE,
      request,
    );

    let satuan = await this.prismaService.satuanBarang.findFirst({
      where: {
        nama: createRequest.nama,
        jenis_barang: createRequest.jenis_barang,
      },
    });

    if (satuan) {
      throw new HttpException('Data already exists.', 400);
    }

    satuan = await this.prismaService.satuanBarang.create({
      data: createRequest,
    });

    return this.toSatuanResponse(satuan);
  }

  async get(id: number): Promise<SatuanResponse> {
    const satuan = await this.getSatuanOr404(id);
    return this.toSatuanResponse(satuan);
  }

  async update(request: UpdateSatuanRequest): Promise<SatuanResponse> {
    const updateRequest: UpdateSatuanRequest = this.validationService.validate(
      SatuanValidation.UPDATE,
      request,
    );

    const satuan = await this.prismaService.satuanBarang.update({
      data: updateRequest,
      where: {
        id: updateRequest.id,
      },
    });

    if (!satuan) {
      throw new HttpException('Data not found.', 404);
    }

    return this.toSatuanResponse(satuan);
  }

  async list(
    page: number,
    size: number,
  ): Promise<WebResponse<SatuanResponse[]>> {
    const skip = size * (page - 1);
    const total = await this.prismaService.satuanBarang.count();
    const totalPages = Math.ceil(total / page);

    const satuans = await this.prismaService.satuanBarang.findMany({
      skip: skip,
      take: size,
    });

    return {
      data: satuans,
      paging: {
        page: page,
        total_page: totalPages,
        size: size,
      },
    };
  }

  async remove(satuan_id: number): Promise<SatuanResponse> {
    let kategori = await this.getSatuanOr404(satuan_id);
    kategori = await this.prismaService.satuanBarang.delete({
      where: { id: satuan_id },
    });

    return this.toSatuanResponse(kategori);
  }

  async search(
    request: SearchSatuanRequest,
  ): Promise<WebResponse<SatuanResponse[]>> {
    const searchRequest: SearchSatuanRequest = this.validationService.validate(
      SatuanValidation.SEARCH,
      request,
    );

    const filters = [];
    if (searchRequest.id) {
      filters.push({
        AND: [
          {
            id: searchRequest.id,
          },
        ],
      });
    }

    if (searchRequest.jenis_barang) {
      filters.push({
        AND: [
          {
            jenis_barang: searchRequest.jenis_barang,
          },
        ],
      });
    }

    if (searchRequest.nama) {
      filters.push({
        AND: [
          {
            nama: {
              contains: searchRequest.nama.toUpperCase(),
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const skip = searchRequest.size * (searchRequest.page - 1);
    const total = await this.prismaService.satuanBarang.count({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    const totalPages = Math.ceil(total / searchRequest.size);
    const data = await this.prismaService.satuanBarang.findMany({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: data.map((satuan) => this.toSatuanResponse(satuan)),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        total_page: totalPages,
      },
    };
  }
}
