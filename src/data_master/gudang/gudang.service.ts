import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import {
  CreateGudangRequest,
  GudangResponse,
  SearchGudangRequest,
  UpdateGudangRequest,
} from '../../model/data.master/gudang.model';
import { GudangValidation } from './gudang.validation';
import {
  AlreadyExistsError,
  NotFoundError,
} from '../../common/toko.exceptions';
import { WebResponse } from '../../model/web.response';

@Injectable()
export class GudangService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getGudangByNama(nama: string) {
    return await this.prismaService.gudang.findFirst({
      where: {
        nama: nama,
      },
    });
  }

  async getGudangOr404(gudang_id: number) {
    const gudang = await this.prismaService.gudang.findUnique({
      where: {
        id: gudang_id,
      },
    });

    if (gudang) {
      return gudang;
    }

    throw new NotFoundError();
  }

  async create(request: CreateGudangRequest): Promise<GudangResponse> {
    const createRequest: CreateGudangRequest = this.validationService.validate(
      GudangValidation.CREATE,
      request,
    );

    let gudang = await this.getGudangByNama(createRequest.nama);
    if (gudang) {
      throw new AlreadyExistsError();
    }

    gudang = await this.prismaService.$transaction(async (tx) => {
      const newGudang = await tx.gudang.create({
        data: createRequest,
      });
      const allBarangs = await tx.barang.findMany();

      const detailGudangs = allBarangs.map((barang) => ({
        barangId: barang.id,
        gudangId: newGudang.id,
        satuanId: barang.satuanId,
        jumlah: barang.jumlahStok,
      }));

      await tx.detailGudang.createMany({
        data: detailGudangs,
      });

      return newGudang;
    });

    return gudang;
  }

  async detail(gudang_id: number): Promise<GudangResponse> {
    const gudang = await this.getGudangOr404(gudang_id);
    return gudang;
  }

  async delete(gudang_id: number): Promise<GudangResponse> {
    const gudang = await this.getGudangOr404(gudang_id);
    return await this.prismaService.gudang.delete({
      where: {
        id: gudang.id,
      },
    });
  }

  async update(request: UpdateGudangRequest): Promise<GudangResponse> {
    const updateRequest: UpdateGudangRequest = this.validationService.validate(
      GudangValidation.UPDATE,
      request,
    );
    let gudang = await this.getGudangOr404(updateRequest.id);
    gudang = await this.prismaService.gudang.update({
      where: {
        id: gudang.id,
      },
      data: updateRequest,
    });
    return gudang;
  }

  async search(
    request: SearchGudangRequest,
  ): Promise<WebResponse<GudangResponse[]>> {
    const searchRequest: SearchGudangRequest = this.validationService.validate(
      GudangValidation.SEARCH,
      request,
    );

    const filters = this.createFilter(searchRequest);
    const total = await this.prismaService.gudang.count({
      where: {
        AND: filters,
      },
    });

    const skip = searchRequest.size * (searchRequest.page - 1);
    const gudangs = await this.prismaService.gudang.findMany({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: gudangs,
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        totalPage: Math.ceil(total / searchRequest.size),
      },
    };
  }

  createFilter(request: SearchGudangRequest) {
    const filters = [];

    if (request.nama) {
      filters.push({
        AND: [
          {
            nama: {
              contains: request.nama,
              mode: 'insensitive',
            },
          },
        ],
      });
    }
    if (request.alamat) {
      filters.push({
        AND: [
          {
            alamat: {
              contains: request.alamat,
              mode: 'insensitive',
            },
          },
        ],
      });
    }
    if (request.keterangan) {
      filters.push({
        AND: [
          {
            keterangan: {
              contains: request.keterangan,
              mode: 'insensitive',
            },
          },
        ],
      });
    }
    if (request.isActive !== undefined) {
      filters.push({
        AND: [
          {
            isActive: request.isActive,
          },
        ],
      });
    }

    return filters;
  }
}
