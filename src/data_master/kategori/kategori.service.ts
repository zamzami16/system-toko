import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import {
  CreateKategoriRequest,
  KategoriResponse,
  SearchkategoriRequest as SearchKategoriRequest,
  UpdatekategoriRequest,
} from '../../model/data.master/kategori.model';
import { KategoriValidation } from './kategori.validation';
import { KategoriBarang } from '@prisma/client';
import { WebResponse } from 'src/model/web.response';

@Injectable()
export class KategoriService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toKategoriResponse(kategori: KategoriBarang): KategoriResponse {
    return {
      id: kategori.id,
      nama: kategori.nama,
      jenis_barang: kategori.jenis_barang,
    };
  }

  async getkategoriOr404(kategori_id: number) {
    const kategori = await this.prismaService.kategoriBarang.findUnique({
      where: { id: kategori_id },
    });

    if (!kategori) {
      throw new HttpException('Data Not Found.', 404);
    }

    return kategori;
  }

  async create(request: CreateKategoriRequest): Promise<KategoriResponse> {
    const createRequest: CreateKategoriRequest =
      this.validationService.validate(KategoriValidation.CREATE, request);

    let kategori = await this.prismaService.kategoriBarang.findFirst({
      where: {
        nama: createRequest.nama,
        jenis_barang: createRequest.jenis_barang,
      },
    });

    if (kategori) {
      throw new HttpException('Data already exists.', 400);
    }

    kategori = await this.prismaService.kategoriBarang.create({
      data: createRequest,
    });

    return this.toKategoriResponse(kategori);
  }

  async get(id: number): Promise<KategoriResponse> {
    const kategori = await this.getkategoriOr404(id);
    return this.toKategoriResponse(kategori);
  }

  async update(request: UpdatekategoriRequest): Promise<KategoriResponse> {
    const updateRequest: UpdatekategoriRequest =
      this.validationService.validate(KategoriValidation.UPDATE, request);

    const kategori = await this.prismaService.kategoriBarang.update({
      data: updateRequest,
      where: {
        id: updateRequest.id,
      },
    });

    if (!kategori) {
      throw new HttpException('Data not found.', 404);
    }

    return this.toKategoriResponse(kategori);
  }

  async list(
    page: number,
    size: number,
  ): Promise<WebResponse<KategoriResponse[]>> {
    const skip = size * (page - 1);
    const total = await this.prismaService.kategoriBarang.count();
    const totalPages = Math.ceil(total / page);

    const kategories = await this.prismaService.kategoriBarang.findMany({
      skip: skip,
      take: size,
    });

    return {
      data: kategories,
      paging: {
        page: page,
        total_page: totalPages,
        size: size,
      },
    };
  }

  async remove(kategori_id: number): Promise<KategoriResponse> {
    let kategori = await this.getkategoriOr404(kategori_id);
    kategori = await this.prismaService.kategoriBarang.delete({
      where: { id: kategori_id },
    });

    return this.toKategoriResponse(kategori);
  }

  async search(
    request: SearchKategoriRequest,
  ): Promise<WebResponse<KategoriResponse[]>> {
    const searchRequest: SearchKategoriRequest =
      this.validationService.validate(KategoriValidation.SEARCH, request);

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
    const total = await this.prismaService.kategoriBarang.count({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    const totalPages = Math.ceil(total / searchRequest.size);
    const data = await this.prismaService.kategoriBarang.findMany({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: data.map((kategori) => this.toKategoriResponse(kategori)),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        total_page: totalPages,
      },
    };
  }
}
