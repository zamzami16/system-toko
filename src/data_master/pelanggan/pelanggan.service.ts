import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ContactService } from '../contact/contact.service';
import {
  CreatePelangganRequest,
  PelangganResponse,
  SearchPelangganRequest,
  UpdatePelangganRequest,
} from '../../model/data.master/pelanggan.model';
import { ValidationService } from '../../common/validation.service';
import { PelangganValidation } from './pelanggan.validation';
import { Contact, JenisPelanggan, Pelanggan } from '@prisma/client';
import { NotFoundError } from '../../common/toko.exceptions';
import { JenisPelangganService } from '../jenis.pelanggan/jenis.pelanggan.service';
import { WebResponse } from '@src/model/web.response';

@Injectable()
export class PelangganService {
  constructor(
    private prismaService: PrismaService,
    private contactService: ContactService,
    private jenisPelangganService: JenisPelangganService,
    private validationService: ValidationService,
  ) {}

  toPelangganResponse(
    pelanggan: Pelanggan,
    contact?: Contact,
    jenisPelanggan?: JenisPelanggan,
  ): PelangganResponse {
    return {
      contact: contact,
      jenisPelanggan: jenisPelanggan,
      contactId: pelanggan.contactId,
      jenisPelangganId: pelanggan.jenisPelangganId,
      isCanCredit: pelanggan.isCanCredit,
      saldoPiutang: pelanggan.saldoPiutang.toNumber(),
      saldoAwalPiutang: pelanggan.saldoAwalPiutang.toNumber(),
      maxPiutang: pelanggan.maxPiutang.toNumber(),
      jatuhTempo: pelanggan.jatuhTempo,
      limitHariPiutang: pelanggan.limitHariPiutang,
      jenisPajak: pelanggan.jenisPajak,
    };
  }

  async getPelangganById(contactId: number) {
    const result = await this.prismaService.pelanggan.findUnique({
      where: {
        contactId: contactId,
      },
      include: {
        contact: true,
        jenisPelanggan: true,
      },
    });
    return result;
  }

  async getPelangganOr404(contactId: number) {
    const result = await this.getPelangganById(contactId);
    if (!result) {
      throw new NotFoundError('Pelanggan does found');
    }
    return result;
  }

  async create(request: CreatePelangganRequest) {
    const createRequest: CreatePelangganRequest =
      this.validationService.validate(PelangganValidation.CREATE, request);
    let contact: Contact;

    if (createRequest.contactId) {
      contact = await this.contactService.getContactById(
        createRequest.contactId,
      );
    } else if (createRequest.contact) {
      contact = await this.contactService.create(createRequest.contact);
    }

    if (!contact) {
      throw new NotFoundError(`Contact not found.`);
    }

    const jenisPelanggan =
      await this.jenisPelangganService.getJenisPelangganOr404(
        createRequest.jenisPelangganId,
      );

    const pelanggan = await this.prismaService.pelanggan.create({
      data: {
        contact: {
          connect: {
            id: contact.id,
          },
        },
        jenisPelanggan: {
          connect: {
            id: jenisPelanggan.id,
          },
        },
        isCanCredit: createRequest.isCanCredit,
        saldoPiutang: createRequest.saldoPiutang,
        maxPiutang: createRequest.maxPiutang,
        limitHariPiutang: createRequest.limitHariPiutang,
        jatuhTempo: createRequest.jatuhTempo,
        jenisPajak: createRequest.jenisPajak,
      },
    });
    return this.toPelangganResponse(pelanggan, contact, jenisPelanggan);
  }

  async detail(contactId: number): Promise<PelangganResponse> {
    const { contact, jenisPelanggan, ...pelanggan } =
      await this.getPelangganOr404(contactId);
    return this.toPelangganResponse(pelanggan, contact, jenisPelanggan);
  }

  async delete(contactId: number): Promise<PelangganResponse> {
    const { contact, jenisPelanggan, ...pelanggan } =
      await this.getPelangganOr404(contactId);

    const deleted = await this.prismaService.pelanggan.delete({
      where: {
        contactId: pelanggan.contactId,
      },
    });

    return this.toPelangganResponse(deleted, contact, jenisPelanggan);
  }

  async update(request: UpdatePelangganRequest): Promise<PelangganResponse> {
    const updateRequest: UpdatePelangganRequest =
      this.validationService.validate(PelangganValidation.UPDATE, request);

    if (updateRequest.jenisPelangganId) {
      await this.jenisPelangganService.getJenisPelangganOr404(
        updateRequest.jenisPelangganId,
      );
    }

    const { contact, jenisPelanggan, ...pelanggan } =
      await this.getPelangganOr404(updateRequest.contactId);

    const pelangganUpdated = await this.prismaService.pelanggan.update({
      where: {
        contactId: pelanggan.contactId,
      },
      data: updateRequest,
    });

    return this.toPelangganResponse(pelangganUpdated, contact, jenisPelanggan);
  }

  async search(
    request: SearchPelangganRequest,
  ): Promise<WebResponse<PelangganResponse[]>> {
    const searchRequest: SearchPelangganRequest =
      this.validationService.validate(PelangganValidation.SEARCH, request);

    const contactFiltrer = this.contactService.createFilter(searchRequest);
    const pelangganFilters = this.createFilter(searchRequest);
    pelangganFilters.push({
      contact: {
        AND: contactFiltrer,
      },
    });

    const total = await this.prismaService.pelanggan.count({
      where: {
        AND: pelangganFilters,
      },
    });
    const skip = searchRequest.size * (searchRequest.page - 1);

    const result = await this.prismaService.pelanggan.findMany({
      where: {
        AND: pelangganFilters,
      },
      take: searchRequest.size,
      skip: skip,
      include: {
        contact: true,
        jenisPelanggan: true,
      },
    });

    const totalPage = Math.ceil(total / searchRequest.size);

    return {
      data: result.map((s) => {
        const { contact, jenisPelanggan, ...pelanggan } = s;
        return this.toPelangganResponse(pelanggan, contact, jenisPelanggan);
      }),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        totalPage: totalPage,
      },
    };
  }

  createFilter(serach: SearchPelangganRequest) {
    const filters = [];
    if (serach.isCanCredit !== undefined) {
      filters.push({
        AND: {
          isCanCredit: serach.isCanCredit,
        },
      });
    }

    if (serach.jenisPajak) {
      filters.push({
        AND: {
          jenisPajak: serach.jenisPajak,
        },
      });
    }

    if (serach.jenisPelanggan) {
      filters.push({
        AND: {
          jenisPelanggan: {
            nama: {
              contains: serach.jenisPelanggan,
              mode: 'insensitive',
            },
          },
        },
      });
    }

    return filters;
  }
}
