import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { SubkategoriValidation } from './subkategori.validation';
import { SubKategoriBarang } from '@prisma/client';
import { WebResponse } from '../../model/web.response';
import {
  CreateSubkategoriRequest,
  SubkategoriResponse,
  UpdateSubkategoriRequest,
  SearchSubkategoriRequest,
} from '../../model/data.master/subkategori.model';

@Injectable()
export class SubkategoriService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  toSubkategoriResponse(kategori: SubKategoriBarang): SubkategoriResponse {
    return {
      id: kategori.id,
      nama: kategori.nama,
      jenisBarang: kategori.jenisBarang,
    };
  }

  async getSubkategoriOr404(subkategoriId: number) {
    const subkategori = await this.prismaService.subKategoriBarang.findUnique({
      where: { id: subkategoriId },
    });

    if (!subkategori) {
      throw new HttpException('Data Not Found.', 404);
    }

    return subkategori;
  }

  async create(
    request: CreateSubkategoriRequest,
  ): Promise<SubkategoriResponse> {
    const createRequest: CreateSubkategoriRequest =
      this.validationService.validate(SubkategoriValidation.CREATE, request);

    let subkategori = await this.prismaService.subKategoriBarang.findFirst({
      where: {
        nama: createRequest.nama,
        jenisBarang: createRequest.jenisBarang,
      },
    });

    if (subkategori) {
      throw new HttpException('Data already exists.', 400);
    }

    subkategori = await this.prismaService.subKategoriBarang.create({
      data: createRequest,
    });

    return this.toSubkategoriResponse(subkategori);
  }

  async get(id: number): Promise<SubkategoriResponse> {
    const kategori = await this.getSubkategoriOr404(id);
    return this.toSubkategoriResponse(kategori);
  }

  async update(
    request: UpdateSubkategoriRequest,
  ): Promise<SubkategoriResponse> {
    const updateRequest: UpdateSubkategoriRequest =
      this.validationService.validate(SubkategoriValidation.UPDATE, request);

    const kategori = await this.prismaService.subKategoriBarang.update({
      data: updateRequest,
      where: {
        id: updateRequest.id,
      },
    });

    if (!kategori) {
      throw new HttpException('Data not found.', 404);
    }

    return this.toSubkategoriResponse(kategori);
  }

  async list(
    page: number,
    size: number,
  ): Promise<WebResponse<SubkategoriResponse[]>> {
    const skip = size * (page - 1);
    const total = await this.prismaService.subKategoriBarang.count();
    const totalPages = Math.ceil(total / page);

    const kategories = await this.prismaService.subKategoriBarang.findMany({
      skip: skip,
      take: size,
    });

    return {
      data: kategories,
      paging: {
        page: page,
        totalPage: totalPages,
        size: size,
      },
    };
  }

  async remove(kategoriId: number): Promise<SubkategoriResponse> {
    let kategori = await this.getSubkategoriOr404(kategoriId);
    kategori = await this.prismaService.subKategoriBarang.delete({
      where: { id: kategoriId },
    });

    return this.toSubkategoriResponse(kategori);
  }

  async search(
    request: SearchSubkategoriRequest,
  ): Promise<WebResponse<SubkategoriResponse[]>> {
    const searchRequest: SearchSubkategoriRequest =
      this.validationService.validate(SubkategoriValidation.SEARCH, request);

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

    if (searchRequest.jenisBarang) {
      filters.push({
        AND: [
          {
            jenisBarang: searchRequest.jenisBarang,
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
    const total = await this.prismaService.subKategoriBarang.count({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    const totalPages = Math.ceil(total / searchRequest.size);
    const data = await this.prismaService.subKategoriBarang.findMany({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: data.map((kategori) => this.toSubkategoriResponse(kategori)),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        totalPage: totalPages,
      },
    };
  }
}
