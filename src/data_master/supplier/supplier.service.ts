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
      contact_id: supplier.contact_id,
      contact: contact,
      saldo_hutang: supplier.saldo_hutang.toNumber(),
      saldo_awal_hutang: supplier.saldo_awal_hutang.toNumber(),
      max_hutang: supplier.max_hutang.toNumber(),
      jatuh_tempo: supplier.jatuh_tempo.toNumber(),
    };
  }

  async getSupplierOr404(contact_id: number) {
    const supplier = await this.prismaService.supplier.findUnique({
      where: {
        contact_id: contact_id,
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
    if (createRequest.contact_id) {
      contact_data = await this.contactService.getContactOr404(
        createRequest.contact_id,
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
        contact_id: contact_data.id,
        saldo_awal_hutang: createRequest.saldo_awal_hutang,
        saldo_hutang: createRequest.saldo_hutang,
        max_hutang: createRequest.max_hutang,
        jatuh_tempo: createRequest.jatuh_tempo,
      },
    });

    return this.toSupplierResponse(supplier, contact_data);
  }

  async detail(contact_id: number): Promise<SupplierResponse> {
    const { contact, ...supplier } = await this.getSupplierOr404(contact_id);
    return this.toSupplierResponse(supplier, contact);
  }

  async delete(contact_id: number): Promise<SupplierResponse> {
    const { contact, ...supplier } = await this.getSupplierOr404(contact_id);
    await this.prismaService.supplier.delete({
      where: {
        contact_id: contact_id,
      },
    });
    return this.toSupplierResponse(supplier, contact);
  }

  async update(request: UpdateSupplierRequest): Promise<SupplierResponse> {
    const updateRequest: UpdateSupplierRequest =
      this.validationService.validate(SupplierValidation.UPDATE, request);

    await this.getSupplierOr404(updateRequest.contact_id);
    const { contact, ...supplier } = await this.prismaService.supplier.update({
      data: updateRequest,
      where: {
        contact_id: updateRequest.contact_id,
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

    const total_page = Math.ceil(total / searchRequest.size);
    return {
      data: suppliers.map((supplierAndContact) => {
        const { contact, ...supplier } = supplierAndContact;
        return this.toSupplierResponse(supplier, contact);
      }),
      paging: {
        page: searchRequest.page,
        size: searchRequest.size,
        total_page: total_page,
      },
    };
  }
}
