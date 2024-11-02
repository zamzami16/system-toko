import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateJenisPelangganRequest,
  JenisPelangganResponse,
  SearchJenisPelangganRequest,
  UpdateJenisPelangganRequest,
} from '../../model/data.master/jenis.pelanggan.model';
import { ValidationService } from '../../common/validation.service';
import { JenisPelangganValidation } from './jenis.pelanggan.validation';
import {
  AlreadyExistsError,
  NotFoundError,
} from '../../common/toko.exceptions';
import { WebResponse } from '../../model/web.response';

@Injectable()
export class JenisPelangganService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async getJenisPelangganByNama(nama: string) {
    return await this.prismaService.jenisPelanggan.findFirst({
      where: {
        nama: nama,
      },
    });
  }

  async getJenisPelangganOr404(jenisPelangganId: number) {
    const jenisPelanggan = await this.prismaService.jenisPelanggan.findFirst({
      where: {
        id: jenisPelangganId,
      },
    });

    if (jenisPelanggan) {
      return jenisPelanggan;
    }

    throw new NotFoundError('Jenis pelanggan not found');
  }

  async create(
    request: CreateJenisPelangganRequest,
  ): Promise<JenisPelangganResponse> {
    const createRequest: CreateJenisPelangganRequest =
      this.validationService.validate(JenisPelangganValidation.CREATE, request);

    let jenisPelanggan = await this.getJenisPelangganByNama(createRequest.nama);

    if (jenisPelanggan) {
      throw new AlreadyExistsError();
    }

    jenisPelanggan = await this.prismaService.jenisPelanggan.create({
      data: createRequest,
    });

    return jenisPelanggan;
  }

  async detail(jenisPelangganId: number): Promise<JenisPelangganResponse> {
    const jenisPelanggan = await this.getJenisPelangganOr404(jenisPelangganId);
    return jenisPelanggan;
  }

  async delete(jenisPelangganId: number): Promise<JenisPelangganResponse> {
    let jenisPelanggan = await this.getJenisPelangganOr404(jenisPelangganId);
    jenisPelanggan = await this.prismaService.jenisPelanggan.delete({
      where: {
        id: jenisPelangganId,
      },
    });
    return jenisPelanggan;
  }

  async update(
    request: UpdateJenisPelangganRequest,
  ): Promise<JenisPelangganResponse> {
    const updateRequest: UpdateJenisPelangganRequest =
      this.validationService.validate(JenisPelangganValidation.UPDATE, request);

    let jenisPelanggan = await this.getJenisPelangganOr404(updateRequest.id);

    if (jenisPelanggan.isDefault && !updateRequest.isDefault) {
      throw new HttpException(
        `Unable change status default to false for default jenis pelanggan.`,
        400,
      );
    }

    jenisPelanggan = await this.prismaService.$transaction(async (tx) => {
      if (updateRequest.isDefault) {
        await tx.jenisPelanggan.updateMany({
          where: {
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return await tx.jenisPelanggan.update({
        data: updateRequest,
        where: {
          id: updateRequest.id,
        },
      });
    });

    return jenisPelanggan;
  }

  async search(
    request: SearchJenisPelangganRequest,
  ): Promise<WebResponse<JenisPelangganResponse[]>> {
    const searchRequest: SearchJenisPelangganRequest =
      this.validationService.validate(JenisPelangganValidation.SEARCH, request);

    const filters = this.createFilter(searchRequest);
    const total = await this.prismaService.jenisPelanggan.count({
      where: {
        AND: filters,
      },
    });
    const skip = searchRequest.size * (searchRequest.page - 1);
    const jenisPelanggans = await this.prismaService.jenisPelanggan.findMany({
      where: {
        AND: filters,
      },
      skip: skip,
      take: searchRequest.size,
    });

    return {
      data: jenisPelanggans,
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        totalPage: Math.ceil(total / searchRequest.size),
      },
    };
  }

  createFilter(search: SearchJenisPelangganRequest) {
    const filters = [];
    if (search.nama) {
      filters.push({
        AND: [
          {
            nama: {
              contains: search.nama,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    if (search.isDefault !== undefined) {
      filters.push({
        AND: [
          {
            isDefault: search.isDefault,
          },
        ],
      });
    }

    return filters;
  }
}
