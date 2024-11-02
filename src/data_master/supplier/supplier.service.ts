import {
  CreateSupplierRequest,
  SearchSupplierRequest,
  SupplierResponse,
  UpdateSupplierRequest,
} from '../../model/data.master/supplier.model';
import { PrismaService } from '../../common/prisma.service';
import { ContactService } from '../contact/contact.service';
import { ValidationService } from '../../common/validation.service';
import { SupplierValidation } from './supplier.validation';
import { Contact, Supplier } from '@prisma/client';
import { ZodError } from 'zod';
import { NotFoundError } from '../../common/toko.exceptions';
import { Injectable } from '@nestjs/common';
import { WebResponse } from '@src/model/web.response';

@Injectable()
export class SupplierService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}

  toSupplierResponse(supplier: Supplier, contact: Contact): SupplierResponse {
    return {
      contactId: supplier.contactId,
      contact: contact,
      saldoHutang: supplier.saldoHutang.toNumber(),
      saldoAwalHutang: supplier.saldoAwalHutang.toNumber(),
      maxHutang: supplier.maxHutang.toNumber(),
      jatuhTempo: supplier.jatuhTempo.toNumber(),
    };
  }

  async getSupplierOr404(contactId: number) {
    const supplier = await this.prismaService.supplier.findUnique({
      where: {
        contactId: contactId,
      },
      include: {
        contact: true,
      },
    });

    if (supplier) {
      return supplier;
    }

    throw new NotFoundError();
  }

  async create(request: CreateSupplierRequest): Promise<SupplierResponse> {
    const createRequest: CreateSupplierRequest =
      this.validationService.validate(SupplierValidation.CREATE, request);

    let contact_data: Contact;
    if (createRequest.contactId) {
      contact_data = await this.contactService.getContactOr404(
        createRequest.contactId,
      );
    } else {
      if (createRequest.contact) {
        contact_data = await this.contactService.create(createRequest.contact);
      } else {
        throw new ZodError([]);
      }
    }

    const supplier = await this.prismaService.supplier.create({
      data: {
        contactId: contact_data.id,
        saldoAwalHutang: createRequest.saldoAwalHutang,
        saldoHutang: createRequest.saldoHutang,
        maxHutang: createRequest.maxHutang,
        jatuhTempo: createRequest.jatuhTempo,
      },
    });

    return this.toSupplierResponse(supplier, contact_data);
  }

  async detail(contactId: number): Promise<SupplierResponse> {
    const { contact, ...supplier } = await this.getSupplierOr404(contactId);
    return this.toSupplierResponse(supplier, contact);
  }

  async delete(contactId: number): Promise<SupplierResponse> {
    const { contact, ...supplier } = await this.getSupplierOr404(contactId);
    await this.prismaService.supplier.delete({
      where: {
        contactId: contactId,
      },
    });
    return this.toSupplierResponse(supplier, contact);
  }

  async update(request: UpdateSupplierRequest): Promise<SupplierResponse> {
    const updateRequest: UpdateSupplierRequest =
      this.validationService.validate(SupplierValidation.UPDATE, request);

    await this.getSupplierOr404(updateRequest.contactId);
    const { contact, ...supplier } = await this.prismaService.supplier.update({
      data: updateRequest,
      where: {
        contactId: updateRequest.contactId,
      },
      include: {
        contact: true,
      },
    });

    return this.toSupplierResponse(supplier, contact);
  }

  async search(
    request: SearchSupplierRequest,
  ): Promise<WebResponse<SupplierResponse[]>> {
    const searchRequest: SearchSupplierRequest =
      this.validationService.validate(SupplierValidation.SEARCH, request);

    const filter = this.contactService.createFilter(searchRequest);

    const total = await this.prismaService.supplier.count({
      where: {
        contact: {
          AND: filter,
        },
      },
    });

    const skip = searchRequest.size * (searchRequest.page - 1);
    const suppliers = await this.prismaService.supplier.findMany({
      where: {
        contact: {
          AND: filter,
        },
      },
      skip: skip,
      take: searchRequest.size,
      include: {
        contact: true,
      },
    });

    const totalPage = Math.ceil(total / searchRequest.size);
    return {
      data: suppliers.map((supplierAndContact) => {
        const { contact, ...supplier } = supplierAndContact;
        return this.toSupplierResponse(supplier, contact);
      }),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        totalPage: totalPage,
      },
    };
  }
}
